const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findByFirebaseUid = async (firebaseUid) => {
  const { rows } = await query(
    `SELECT u.*, ARRAY_AGG(r.code) FILTER (WHERE r.code IS NOT NULL) AS roles
       FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.firebase_uid = $1
        AND u.is_active = true
   GROUP BY u.id`,
    [firebaseUid]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await query(
    `SELECT u.*, ARRAY_AGG(r.code) FILTER (WHERE r.code IS NOT NULL) AS roles
       FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.id = $1
   GROUP BY u.id`,
    [id]
  );
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const { rows } = await query(`SELECT * FROM users WHERE email = $1`, [email]);
  return rows[0] || null;
};

const create = async ({ firebaseUid, email, fullName, phone, department }) => {
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO users (id, firebase_uid, email, full_name, phone, department, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,true)
     RETURNING *`,
    [id, firebaseUid, email, fullName || null, phone || null, department || null]
  );
  return rows[0];
};

const assignRole = async (userId, roleCode, assignedBy = null) => {
  const { rows: roleRows } = await query(`SELECT id FROM roles WHERE code = $1`, [roleCode]);
  if (!roleRows.length) throw new Error(`Role not found: ${roleCode}`);
  const roleId = roleRows[0].id;
  await query(
    `INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by, assigned_at)
     VALUES ($1,$2,false,$3,NOW())
     ON CONFLICT (user_id, role_id) DO NOTHING`,
    [userId, roleId, assignedBy]
  );
};

const list = async () => {
  const { rows } = await query(
    `SELECT u.id, u.email, u.full_name, u.department, u.is_active,
            ARRAY_AGG(r.code) FILTER (WHERE r.code IS NOT NULL) AS roles
       FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
   GROUP BY u.id
   ORDER BY u.full_name`
  );
  return rows;
};

module.exports = { findByFirebaseUid, findById, findByEmail, create, assignRole, list };
