const { body, param, query: qv } = require('express-validator');

/* ── Auth ──────────────────────────────────────────────── */
const loginRules = [
  body('firebaseToken').notEmpty().withMessage('firebaseToken is required'),
];

/* ── Fund Registration ─────────────────────────────────── */
const registrationRules = [
  body('appliedAs').isIn(['TEAM', 'INDIVIDUAL']).withMessage('appliedAs must be TEAM or INDIVIDUAL'),
  body('teamCount')
    .if(body('appliedAs').equals('TEAM'))
    .isInt({ min: 2 }).withMessage('teamCount must be ≥ 2 for TEAM'),
  body('fundingAgency').isIn(['GOV', 'NON_GOV']).withMessage('fundingAgency must be GOV or NON_GOV'),
  body('fundsFrom').isIn(['NATIONAL', 'INTERNATIONAL']).withMessage('fundsFrom must be NATIONAL or INTERNATIONAL'),
  body('activityCategoryId').isInt().withMessage('activityCategoryId required'),
  body('fundInr').isNumeric().withMessage('fundInr must be numeric'),
  body('appliedDate').isISO8601().withMessage('appliedDate must be a valid date'),
];

/* ── Grant ID ──────────────────────────────────────────── */
const grantIdRules = [
  body('registrationId').isUUID().withMessage('registrationId must be a valid UUID'),
];

/* ── Grant Request ─────────────────────────────────────── */
const grantRequestRules = [
  body('grantIdId').isUUID().withMessage('grantIdId must be a valid UUID'),
];

/* ── Approval ──────────────────────────────────────────── */
const approvalRules = [
  param('requestId').isUUID().withMessage('requestId must be a valid UUID'),
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('status must be APPROVED or REJECTED'),
];

module.exports = { loginRules, registrationRules, grantIdRules, grantRequestRules, approvalRules };
