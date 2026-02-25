const { query } = require('../config/db');

/**
 * Generate College Grants Registration ID.
 * Format: GR + YY + 4-digit sequence  →  e.g. GR251001
 *
 * The sequence is the count of registrations created this calendar year + 1,
 * padded to 4 digits.
 */
async function generateRegId() {
  const yy = String(new Date().getFullYear()).slice(-2);
  const prefix = `GR${yy}`;

  // Count existing IDs that start with this year prefix to derive next sequence
  const { rows } = await query(
    `SELECT COUNT(*) AS cnt FROM registrations WHERE reg_id LIKE $1`,
    [`${prefix}%`]
  );
  const seq = (Number(rows[0].cnt) + 1).toString().padStart(4, '0');
  return `${prefix}${seq}`;
}

/**
 * Generate 10-char Grant / Activity ID.
 * Format:  YY  +  categoryCode(2-4)  +  schemeCode(2-4)  +  requestNo(2)
 *
 * Examples:
 *   25  +  IE  +  TG  +  01  =  25IETG01   (8 chars)  ← falls under 10 with longer codes
 *   25  +  IEEE  +  TG  +  01  =  25IEEETG01  (10 chars)
 *
 * requestNo is auto-incremented per year + category combination.
 *
 * @param {string} categoryCode  e.g. "IEEE", "CC", "RND"
 * @param {string} schemeCode    2-4 char code from activity_details
 */
async function generateGrantId(categoryCode, schemeCode) {
  const yy = String(new Date().getFullYear()).slice(-2);

  // Count existing grant IDs for this year + category to derive request number
  const prefix = `${yy}${categoryCode}`;
  const { rows } = await query(
    `SELECT COUNT(*) AS cnt FROM grant_ids WHERE grant_id LIKE $1`,
    [`${prefix}%`]
  );
  const reqNo = (Number(rows[0].cnt) + 1).toString().padStart(2, '0');
  const grantId = `${yy}${categoryCode}${schemeCode}${reqNo}`;
  return { grantId, requestNo: reqNo };
}

module.exports = { generateRegId, generateGrantId };
