const registrationService = require('../services/registration.service');
const ActivityModel       = require('../models/activityCategory.model');
const S3Service           = require('../services/s3.service');
const { ok, created, notFound } = require('../utils/response');

async function listCategories(req, res, next) {
  try {
    const data = await ActivityModel.listCategories();
    return ok(res, data);
  } catch (err) { next(err); }
}

async function listDetails(req, res, next) {
  try {
    const data = await ActivityModel.listDetails(Number(req.params.categoryId));
    return ok(res, data);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const isAdmin = req.user.roles.includes('HOD') || req.user.roles.includes('PRINCIPAL');
    const registration = await registrationService.createRegistration(req.user.id, req.body);

    // Handle file uploads if present
    if (req.files) {
      await registrationService.saveRegistrationFiles(registration.id, req.files);
    }

    const full = await registrationService.getRegistration(registration.id);
    return created(res, full, 'Registration created');
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const isAdmin = req.user.roles.some((r) => ['HOD', 'PRINCIPAL', 'INSTITUTION'].includes(r));
    const { status, categoryId, limit, offset } = req.query;
    const data = await registrationService.listRegistrations(
      req.user.id, isAdmin,
      { status, categoryId: categoryId ? Number(categoryId) : undefined,
        limit: Number(limit) || 50, offset: Number(offset) || 0 }
    );
    return ok(res, data);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const data = await registrationService.getRegistration(req.params.id);
    return ok(res, data);
  } catch (err) { next(err); }
}

async function submit(req, res, next) {
  try {
    const data = await registrationService.submitRegistration(req.params.id, req.user.id);
    return ok(res, data, 'Registration submitted');
  } catch (err) { next(err); }
}

async function getFileUrl(req, res, next) {
  try {
    const url = await S3Service.getPresignedUrl(req.params.key);
    return ok(res, { url });
  } catch (err) { next(err); }
}

module.exports = { listCategories, listDetails, create, list, getOne, submit, getFileUrl };
