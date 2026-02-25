const { Router } = require('express');
const ctrl = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/stats',           authenticate, ctrl.getStats);
router.get('/recent-activity', authenticate, ctrl.getRecentActivity);

module.exports = router;
