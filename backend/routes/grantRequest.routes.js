const { Router } = require('express');
const ctrl = require('../controllers/grantRequest.controller');
const { authenticate }          = require('../middlewares/auth.middleware');
const { validate }              = require('../middlewares/validate.middleware');
const { grantRequestRules }     = require('../utils/validators');
const { uploadRequestFiles }    = require('../middlewares/upload.middleware');

const router = Router();

router.post('/',    authenticate, uploadRequestFiles, grantRequestRules, validate, ctrl.create);
router.get('/',     authenticate, ctrl.list);
router.get('/:id',  authenticate, ctrl.getOne);

module.exports = router;
