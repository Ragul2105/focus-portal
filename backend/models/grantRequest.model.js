const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const BASE_SELECT = `
  SELECT gr.*,
         g.grant_id,  g.scheme_code,
         g.amount_granted_inr, g.amount_granted_usd,
         r.reg_id, r.fund_inr, r.fund_usd,
         u.full_name AS user_name, u.department AS user_dept,
         ac.code AS category_code, ac.name AS category_name,
         ad.code AS detail_code,   ad.name AS detail_name
    FROM grant_requests gr
    JOIN grant_ids g ON g.id = gr.grant_id_id
    JOIN registrations r ON r.id = g.registration_id
    JOIN users u ON u.id = gr.requested_by
    LEFT JOIN activity_categories ac ON ac.id = r.activity_category_id
    LEFT JOIN activity_details    ad ON ad.id = r.activity_detail_id
`;

const findById = async (id) => {
  const { rows } = await query(`${BASE_SELECT} WHERE gr.id = $1`, [id]);
  return rows[0] || null;
};

const listAll = async ({ status, userId, limit = 50, offset = 0 } = {}) => {
  let sql = `${BASE_SELECT} WHERE 1=1`;
  const params = [];
  if (status) { params.push(status); sql += ` AND gr.status = $${params.length}`; }
  if (userId) { params.push(userId); sql += ` AND gr.requested_by = $${params.length}`; }
  params.push(limit, offset);
  sql += ` ORDER BY gr.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const { rows } = await query(sql, params);
  return rows;
};

const pendingApprovalCount = async () => {
  const { rows } = await query(`SELECT COUNT(*) AS cnt FROM grant_requests WHERE status = 'PENDING'`);
  return Number(rows[0].cnt);
};

const create = async ({ grantIdId, requestedBy, requestedAmountInr, requestedAmountUsd }) => {
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO grant_requests
       (id, grant_id_id, requested_by, requested_amount_inr, requested_amount_usd, status)
     VALUES ($1,$2,$3,$4,$5,'PENDING')
     RETURNING *`,
    [id, grantIdId, requestedBy, requestedAmountInr || null, requestedAmountUsd || null]
  );
  return rows[0];
};

const updateStatus = async (id, status) => {
  const { rows } = await query(
    `UPDATE grant_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0];
};

/* ── Files ── */
const addFile = async ({ grantRequestId, fileType, s3Key, fileName, contentType, sizeBytes }) => {
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO request_files
       (id, request_id, field_name, s3_key, original_name, mime_type, size_bytes)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [id, grantRequestId, fileType, s3Key, fileName, contentType, sizeBytes]
  );
  return rows[0];
};

const getFiles = async (grantRequestId) => {
  const { rows } = await query(
    `SELECT * FROM request_files WHERE request_id = $1`,
    [grantRequestId]
  );
  return rows;
};

module.exports = { findById, listAll, pendingApprovalCount, create, updateStatus, addFile, getFiles };
