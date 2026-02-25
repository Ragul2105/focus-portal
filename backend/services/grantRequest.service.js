const GrantRequestModel = require('../models/grantRequest.model');
const GrantIdModel      = require('../models/grantId.model');
const ApprovalModel     = require('../models/approval.model');
const { NotFoundError, ValidationError } = require('../utils/errors');

async function createRequest(userId, data) {
  const { grantIdId, requestedAmountInr, requestedAmountUsd } = data;

  // Verify the grant ID exists
  const grantIdRecord = await GrantIdModel.findById(grantIdId);
  if (!grantIdRecord) throw new NotFoundError('Grant ID not found');

  // Create the request
  const request = await GrantRequestModel.create({
    grantIdId,
    requestedBy: userId,
    requestedAmountInr,
    requestedAmountUsd,
  });

  // Pre-create HOD + PRINCIPAL approval slots
  await ApprovalModel.createApprovalSlots(request.id);

  return request;
}

async function saveRequestFiles(grantRequestId, files = {}) {
  const saved = [];
  if (files.requisitionLetter?.[0]) {
    const f = files.requisitionLetter[0];
    saved.push(await GrantRequestModel.addFile({
      grantRequestId,
      fileType:    'REQUISITION',
      s3Key:       f.key,
      fileName:    f.originalname,
      contentType: f.mimetype,
      sizeBytes:   f.size,
    }));
  }
  if (files.authorizationLetter?.[0]) {
    const f = files.authorizationLetter[0];
    saved.push(await GrantRequestModel.addFile({
      grantRequestId,
      fileType:    'AUTHORIZATION',
      s3Key:       f.key,
      fileName:    f.originalname,
      contentType: f.mimetype,
      sizeBytes:   f.size,
    }));
  }
  return saved;
}

async function getRequest(id) {
  const req = await GrantRequestModel.findById(id);
  if (!req) throw new NotFoundError('Grant request not found');
  const files     = await GrantRequestModel.getFiles(id);
  const approvals = await ApprovalModel.findByRequest(id);
  return { ...req, files, approvals };
}

async function listRequests(userId, isAdmin, filters) {
  if (isAdmin) return GrantRequestModel.listAll(filters);
  return GrantRequestModel.listAll({ ...filters, userId });
}

module.exports = { createRequest, saveRequestFiles, getRequest, listRequests };
