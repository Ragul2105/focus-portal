const grantRequestService = require('../services/grantRequest.service');
const { ok, created } = require('../utils/response');

async function create(req, res, next) {
  try {
    const request = await grantRequestService.createRequest(req.user.id, req.body);

    if (req.files) {
      await grantRequestService.saveRequestFiles(request.id, req.files);
    }

    const full = await grantRequestService.getRequest(request.id);
    return created(res, full, 'Grant request submitted');
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const isAdmin = req.user.roles.some((r) => ['HOD', 'PRINCIPAL', 'INSTITUTION'].includes(r));
    const { status, limit, offset } = req.query;
    const data = await grantRequestService.listRequests(
      req.user.id, isAdmin,
      { status, limit: Number(limit) || 50, offset: Number(offset) || 0 }
    );
    return ok(res, data);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const data = await grantRequestService.getRequest(req.params.id);
    return ok(res, data);
  } catch (err) { next(err); }
}

module.exports = { create, list, getOne };
