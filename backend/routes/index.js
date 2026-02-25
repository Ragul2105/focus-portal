const { Router } = require('express');

const authRoutes         = require('./auth.routes');
const registrationRoutes = require('./registration.routes');
const grantIdRoutes      = require('./grantId.routes');
const grantRequestRoutes = require('./grantRequest.routes');
const approvalRoutes     = require('./approval.routes');
const letterRoutes       = require('./letter.routes');
const dashboardRoutes    = require('./dashboard.routes');

const router = Router();

router.use('/auth',            authRoutes);
router.use('/registrations',   registrationRoutes);
router.use('/grant-ids',       grantIdRoutes);
router.use('/grant-requests',  grantRequestRoutes);
router.use('/approvals',       approvalRoutes);
router.use('/letters',         letterRoutes);
router.use('/dashboard',       dashboardRoutes);

// Health check
router.get('/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = router;
