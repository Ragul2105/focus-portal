const { Router } = require('express');
const ctrl = require('../controllers/grantId.controller');
const { authenticate }  = require('../middlewares/auth.middleware');
const { validate }      = require('../middlewares/validate.middleware');
const { grantIdRules }  = require('../utils/validators');

const router = Router();

// by-registration must come before /:id to avoid param conflict
router.get('/by-registration/:registrationId', authenticate, ctrl.byRegistration);

router.post('/',    authenticate, grantIdRules, validate, ctrl.generate);
router.get('/',     authenticate, ctrl.list);
router.get('/:id',  authenticate, ctrl.getOne);

module.exports = router;
