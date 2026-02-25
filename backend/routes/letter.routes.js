const { Router } = require('express');
const ctrl = require('../controllers/letter.controller');
const { authenticate }  = require('../middlewares/auth.middleware');
const { requireRoles }  = require('../middlewares/role.middleware');

const router = Router();

// Generate HO Letter (approved requests only)
router.post(
  '/:requestId/generate',
  authenticate,
  requireRoles('HOD', 'PRINCIPAL', 'STAFF'),
  ctrl.generate
);

// List letters for a request
router.get('/:requestId', authenticate, ctrl.list);

// Download via presigned URL  (key is base64/encoded in client)
router.get('/download/:s3Key', authenticate, ctrl.download);

module.exports = router;
