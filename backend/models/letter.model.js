const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findByRequest = async (grantRequestId) => {
  const { rows } = await query(
    `SELECT * FROM generated_letters WHERE grant_request_id = $1 ORDER BY generated_at DESC`,
    [grantRequestId]
  );
  return rows;
};

const create = async ({ grantRequestId, letterType, s3Key, fileName, contentType, sizeBytes, generatedBy }) => {
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO generated_letters
       (id, grant_request_id, letter_type, s3_key, file_name, content_type, size_bytes, generated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [id, grantRequestId, letterType, s3Key, fileName, contentType, sizeBytes, generatedBy]
  );
  return rows[0];
};

module.exports = { findByRequest, create };
