const { Router } = require('express');
const ctrl   = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate }     = require('../middlewares/validate.middleware');
const { loginRules }   = require('../utils/validators');

const router = Router();

// POST /api/auth/login
router.post('/login', loginRules, validate, ctrl.login);

// GET /api/auth/me  (requires JWT)
router.get('/me', authenticate, ctrl.me);

module.exports = router;
