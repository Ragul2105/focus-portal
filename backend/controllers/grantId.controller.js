const grantIdService = require('../services/grantId.service');
const { ok, created } = require('../utils/response');

async function generate(req, res, next) {
  try {
    const { registrationId, amountGrantedInr, amountGrantedUsd } = req.body;
    const record = await grantIdService.generateId(
      registrationId,
      { amountGrantedInr, amountGrantedUsd },
      req.user.id
    );
    return created(res, record, 'Grant ID generated');
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const { limit, offset } = req.query;
    const data = await grantIdService.listGrantIds({
      limit: Number(limit) || 50,
      offset: Number(offset) || 0,
    });
    return ok(res, data);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const data = await grantIdService.getGrantId(req.params.id);
    return ok(res, data);
  } catch (err) { next(err); }
}

async function byRegistration(req, res, next) {
  try {
    const data = await grantIdService.getByRegistration(req.params.registrationId);
    return ok(res, data);
  } catch (err) { next(err); }
}

module.exports = { generate, list, getOne, byRegistration };
