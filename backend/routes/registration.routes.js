const { Router } = require('express');
const ctrl = require('../controllers/registration.controller');
const { authenticate }            = require('../middlewares/auth.middleware');
const { validate }                = require('../middlewares/validate.middleware');
const { registrationRules }       = require('../utils/validators');
const { uploadRegistrationFiles } = require('../middlewares/upload.middleware');

const router = Router();

// Activity categories & details (lookup)
router.get('/categories',                         authenticate, ctrl.listCategories);
router.get('/categories/:categoryId/details',     authenticate, ctrl.listDetails);

// File URL (presigned) — must be before /:id to avoid param conflict
router.get('/file/:key',  authenticate, ctrl.getFileUrl);

// Registrations CRUD
router.post('/',         authenticate, uploadRegistrationFiles, registrationRules, validate, ctrl.create);
router.get('/',          authenticate, ctrl.list);
router.get('/:id',       authenticate, ctrl.getOne);
router.post('/:id/submit', authenticate, ctrl.submit);

module.exports = router;
