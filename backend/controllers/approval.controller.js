const approvalService = require('../services/approval.service');
const { ok } = require('../utils/response');

async function decide(req, res, next) {
  try {
    const { status, remarks } = req.body;
    const result = await approvalService.decide(
      req.params.requestId,
      req.user.id,
      req.user.roles,
      { status, remarks }
    );
    return ok(res, result, `Request ${result.step} decision recorded`);
  } catch (err) { next(err); }
}

async function getApprovals(req, res, next) {
  try {
    const data = await approvalService.getApprovals(req.params.requestId);
    return ok(res, data);
  } catch (err) { next(err); }
}

module.exports = { decide, getApprovals };
