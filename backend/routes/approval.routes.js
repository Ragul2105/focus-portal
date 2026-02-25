const { Router } = require('express');
const ctrl = require('../controllers/approval.controller');
const { authenticate }    = require('../middlewares/auth.middleware');
const { requireRoles }    = require('../middlewares/role.middleware');
const { validate }        = require('../middlewares/validate.middleware');
const { approvalRules }   = require('../utils/validators');

const router = Router();

// POST /api/approvals/:requestId  — HOD or PRINCIPAL only
router.post(
  '/:requestId',
  authenticate,
  requireRoles('HOD', 'PRINCIPAL'),
  approvalRules,
  validate,
  ctrl.decide
);

// GET /api/approvals/:requestId
router.get('/:requestId', authenticate, ctrl.getApprovals);

module.exports = router;
