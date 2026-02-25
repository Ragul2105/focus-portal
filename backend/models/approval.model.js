const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findByRequest = async (grantRequestId) => {
  const { rows } = await query(
    `SELECT a.*, u.full_name AS decided_by_name
       FROM approvals a
  LEFT JOIN users u ON u.id = a.approver_id
      WHERE a.request_id = $1
   ORDER BY a.step`,
    [grantRequestId]
  );
  return rows;
};

const findPendingStep = async (grantRequestId, role) => {
  const { rows } = await query(
    `SELECT * FROM approvals
      WHERE request_id = $1 AND role = $2 AND decision IS NULL`,
    [grantRequestId, role]
  );
  return rows[0] || null;
};

/**
 * Create pending approval slots for a new grant request.
 * We pre-create HOD and PRINCIPAL rows with decision NULL (pending).
 */
const createApprovalSlots = async (grantRequestId) => {
  const slots = [{ role: 'HOD', step: 1 }, { role: 'PRINCIPAL', step: 2 }];
  for (const { role, step } of slots) {
    const id = uuidv4();
    await query(
      `INSERT INTO approvals (id, request_id, role, step)
       VALUES ($1,$2,$3,$4)`,
      [id, grantRequestId, role, step]
    );
  }
};

const decide = async (id, { status, decidedBy, remarks }) => {
  const { rows } = await query(
    `UPDATE approvals
        SET decision = $1, approver_id = $2, comments = $3, decided_at = NOW()
      WHERE id = $4
  RETURNING *`,
    [status, decidedBy, remarks || null, id]
  );
  return rows[0];
};

module.exports = { findByRequest, findPendingStep, createApprovalSlots, decide };
