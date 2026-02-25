const { query, getClient } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findById = async (id) => {
  const { rows } = await query(
    `SELECT r.*,
            ac.code  AS category_code,
            ac.name  AS category_name,
            ad.code  AS detail_code,
            ad.name  AS detail_name
       FROM registrations r
  LEFT JOIN activity_categories ac ON ac.id = r.activity_category_id
  LEFT JOIN activity_details    ad ON ad.id = r.activity_detail_id
      WHERE r.id = $1`,
    [id]
  );
  return rows[0] || null;
};

const findByRegId = async (regId) => {
  const { rows } = await query(
    `SELECT r.*,
            ac.code  AS category_code,
            ac.name  AS category_name,
            ad.code  AS detail_code,
            ad.name  AS detail_name
       FROM registrations r
  LEFT JOIN activity_categories ac ON ac.id = r.activity_category_id
  LEFT JOIN activity_details    ad ON ad.id = r.activity_detail_id
      WHERE r.reg_id = $1`,
    [regId]
  );
  return rows[0] || null;
};

const listByUser = async (userId, { status, categoryId } = {}) => {
  let sql = `
    SELECT r.*,
           ac.code AS category_code, ac.name AS category_name,
           ad.code AS detail_code,   ad.name AS detail_name
      FROM registrations r
 LEFT JOIN activity_categories ac ON ac.id = r.activity_category_id
 LEFT JOIN activity_details    ad ON ad.id = r.activity_detail_id
     WHERE r.user_id = $1`;
  const params = [userId];
  if (status) { params.push(status); sql += ` AND r.status = $${params.length}`; }
  if (categoryId) { params.push(categoryId); sql += ` AND r.activity_category_id = $${params.length}`; }
  sql += ` ORDER BY r.created_at DESC`;
  const { rows } = await query(sql, params);
  return rows;
};

const listAll = async ({ userId, status, categoryId, limit = 50, offset = 0 } = {}) => {
  let sql = `
    SELECT r.*,
           u.full_name AS user_name, u.department AS user_dept,
           ac.code AS category_code, ac.name AS category_name,
           ad.code AS detail_code,   ad.name AS detail_name
      FROM registrations r
 LEFT JOIN users u ON u.id = r.user_id
 LEFT JOIN activity_categories ac ON ac.id = r.activity_category_id
 LEFT JOIN activity_details    ad ON ad.id = r.activity_detail_id
     WHERE 1=1`;
  const params = [];
  if (userId)     { params.push(userId);     sql += ` AND r.user_id = $${params.length}`; }
  if (status)     { params.push(status);     sql += ` AND r.status = $${params.length}`; }
  if (categoryId) { params.push(categoryId); sql += ` AND r.activity_category_id = $${params.length}`; }
  params.push(limit, offset);
  sql += ` ORDER BY r.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const { rows } = await query(sql, params);
  return rows;
};

const create = async (data, regId) => {
  const id = uuidv4();
  const {
    userId, appliedAs, teamCount, fundingAgency, fundsFrom,
    activityCategoryId, activityDetailId, activityDetailText,
    fundInr, fundUsd, applicationNumber, appliedDate,
  } = data;

  const { rows } = await query(
    `INSERT INTO registrations
       (id, reg_id, user_id, applied_as, team_count, funding_agency, funds_from,
        activity_category_id, activity_detail_id, activity_detail_text,
        fund_inr, fund_usd, application_number, applied_date, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'DRAFT')
     RETURNING *`,
    [
      id, regId, userId, appliedAs, teamCount || null, fundingAgency, fundsFrom,
      activityCategoryId, activityDetailId || null, activityDetailText || null,
      fundInr, fundUsd || null, applicationNumber || null, appliedDate,
    ]
  );
  return rows[0];
};

const updateStatus = async (id, status) => {
  const { rows } = await query(
    `UPDATE registrations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0];
};

/* ── Files ── */
const addFile = async ({ registrationId, fileType, s3Key, fileName, contentType, sizeBytes }) => {
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO registration_files
       (id, registration_id, field_name, s3_key, original_name, mime_type, size_bytes)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [id, registrationId, fileType, s3Key, fileName, contentType, sizeBytes]
  );
  return rows[0];
};

const getFiles = async (registrationId) => {
  const { rows } = await query(
    `SELECT * FROM registration_files WHERE registration_id = $1`,
    [registrationId]
  );
  return rows;
};

module.exports = { findById, findByRegId, listByUser, listAll, create, updateStatus, addFile, getFiles };
