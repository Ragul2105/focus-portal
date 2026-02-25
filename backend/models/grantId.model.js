const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findById = async (id) => {
  const { rows } = await query(
    `SELECT g.*,
            r.reg_id, r.fund_inr, r.fund_usd,
            r.activity_category_id, r.activity_detail_id,
            ac.code AS category_code, ac.name AS category_name,
            ad.code AS detail_code,   ad.name AS detail_name
       FROM grant_ids g
  LEFT JOIN registrations r ON r.id = g.registration_id
  LEFT JOIN activity_categories ac ON ac.id = r.activity_category_id
  LEFT JOIN activity_details    ad ON ad.id = r.activity_detail_id
      WHERE g.id = $1`,
    [id]
  );
  return rows[0] || null;
};

const findByGrantId = async (grantId) => {
  const { rows } = await query(
    `SELECT g.*,
            r.reg_id, r.activity_category_id, r.activity_detail_id,
            ac.code AS category_code, ac.name AS category_name,
            ad.code AS detail_code,   ad.name AS detail_name
       FROM grant_ids g
  LEFT JOIN registrations r ON r.id = g.registration_id
  LEFT JOIN activity_categories ac ON ac.id = r.activity_category_id
  LEFT JOIN activity_details    ad ON ad.id = r.activity_detail_id
      WHERE g.grant_id = $1`,
    [grantId]
  );
  return rows[0] || null;
};

const findByRegistrationId = async (registrationId) => {
  const { rows } = await query(
    `SELECT * FROM grant_ids WHERE registration_id = $1`,
    [registrationId]
  );
  return rows;
};

const listAll = async ({ limit = 50, offset = 0 } = {}) => {
  const { rows } = await query(
    `SELECT g.*,
            r.reg_id, u.full_name AS user_name, u.department AS user_dept,
            ac.code AS category_code, ac.name AS category_name,
            ad.code AS detail_code,   ad.name AS detail_name
       FROM grant_ids g
  LEFT JOIN registrations r ON r.id = g.registration_id
  LEFT JOIN users u ON u.id = r.user_id
  LEFT JOIN activity_categories ac ON ac.id = r.activity_category_id
  LEFT JOIN activity_details    ad ON ad.id = r.activity_detail_id
   ORDER BY g.generated_at DESC
      LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
};

const create = async ({ registrationId, grantId, requestNo, schemeCode, amountGrantedInr, amountGrantedUsd, generatedBy }) => {
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO grant_ids
       (id, registration_id, grant_id, request_no, scheme_code,
        amount_granted_inr, amount_granted_usd, generated_by, generated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
     RETURNING *`,
    [id, registrationId, grantId, requestNo, schemeCode,
     amountGrantedInr || null, amountGrantedUsd || null, generatedBy]
  );
  return rows[0];
};

module.exports = { findById, findByGrantId, findByRegistrationId, listAll, create };
