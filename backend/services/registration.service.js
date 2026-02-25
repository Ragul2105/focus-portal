const RegistrationModel  = require('../models/registration.model');
const ActivityModel      = require('../models/activityCategory.model');
const { generateRegId }  = require('../utils/idGenerator');
const { NotFoundError, ValidationError } = require('../utils/errors');

async function createRegistration(userId, data) {
  // Validate activity detail if a non-OTHER category is used
  const { activityCategoryId, activityDetailId, activityDetailText } = data;
  const categories = await ActivityModel.listCategories();
  const cat = categories.find((c) => c.id === Number(activityCategoryId));
  if (!cat) throw new ValidationError('Invalid activityCategoryId');

  if (cat.allows_free_text && !activityDetailText) {
    throw new ValidationError('activityDetailText is required for "Others" category');
  }
  if (cat.requires_detail && !activityDetailId && !cat.allows_free_text) {
    throw new ValidationError('activityDetailId is required for this category');
  }

  const regId = await generateRegId();
  const registration = await RegistrationModel.create({ ...data, userId }, regId);
  return registration;
}

async function saveRegistrationFiles(registrationId, files = {}) {
  const saved = [];
  if (files.applicationForm?.[0]) {
    const f = files.applicationForm[0];
    saved.push(await RegistrationModel.addFile({
      registrationId,
      fileType:    'APPLICATION_FORM',
      s3Key:       f.key,
      fileName:    f.originalname,
      contentType: f.mimetype,
      sizeBytes:   f.size,
    }));
  }
  if (files.confirmationForm?.[0]) {
    const f = files.confirmationForm[0];
    saved.push(await RegistrationModel.addFile({
      registrationId,
      fileType:    'CONFIRMATION_FORM',
      s3Key:       f.key,
      fileName:    f.originalname,
      contentType: f.mimetype,
      sizeBytes:   f.size,
    }));
  }
  return saved;
}

async function submitRegistration(id, userId) {
  const reg = await RegistrationModel.findById(id);
  if (!reg) throw new NotFoundError('Registration not found');
  if (reg.user_id !== userId) throw new ValidationError('Not authorised to submit this registration');
  if (reg.status === 'SUBMITTED') throw new ValidationError('Already submitted');
  return RegistrationModel.updateStatus(id, 'SUBMITTED');
}

async function getRegistration(id) {
  const reg = await RegistrationModel.findById(id);
  if (!reg) throw new NotFoundError('Registration not found');
  const files = await RegistrationModel.getFiles(id);
  return { ...reg, files };
}

async function listRegistrations(userId, isAdmin, filters) {
  if (isAdmin) return RegistrationModel.listAll(filters);
  return RegistrationModel.listByUser(userId, filters);
}

module.exports = { createRegistration, saveRegistrationFiles, submitRegistration, getRegistration, listRegistrations };
