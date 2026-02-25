const multer  = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const { s3, BUCKET } = require('../config/s3');

/** Maximum allowed upload size: 10 MB */
const MAX_SIZE = 10 * 1024 * 1024;

/** Only allow PDF files */
const pdfFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

/**
 * Factory: create a multer instance that uploads to S3 under a given folder.
 * @param {string} folder  e.g. 'registrations' | 'requests' | 'letters'
 */
const createUploader = (folder) =>
  multer({
    storage: multerS3({
      s3,
      bucket: BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (_req, file, cb) => {
        const ext  = file.originalname.split('.').pop();
        const name = `${folder}/${uuidv4()}.${ext}`;
        cb(null, name);
      },
    }),
    fileFilter: pdfFilter,
    limits: { fileSize: MAX_SIZE },
  });

/** Registration uploads: application_form + confirmation_form */
const uploadRegistrationFiles = createUploader('registrations').fields([
  { name: 'applicationForm',   maxCount: 1 },
  { name: 'confirmationForm',  maxCount: 1 },
]);

/** Grant request uploads: requisition + authorization */
const uploadRequestFiles = createUploader('requests').fields([
  { name: 'requisitionLetter',  maxCount: 1 },
  { name: 'authorizationLetter', maxCount: 1 },
]);

module.exports = { uploadRegistrationFiles, uploadRequestFiles };
