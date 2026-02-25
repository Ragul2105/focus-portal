const ApprovalModel     = require('../models/approval.model');
const GrantRequestModel = require('../models/grantRequest.model');
const UserModel         = require('../models/user.model');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');
const emailService = require('./email.service');

/**
 * Decide on a grant request approval step.
 *
 * Decision rules:
 *   - HOD can act on the HOD step.
 *   - PRINCIPAL can act on the PRINCIPAL step, but only after HOD has APPROVED.
 *   - If any step is REJECTED the overall request becomes REJECTED.
 *   - If PRINCIPAL approves, the overall request becomes APPROVED.
 */
async function decide(requestId, decidedBy, userRoles, { status, remarks }) {
  const request = await GrantRequestModel.findById(requestId);
  if (!request) throw new NotFoundError('Grant request not found');
  if (!['PENDING', 'HOD_APPROVED'].includes(request.status)) {
    throw new ValidationError(`Request is already ${request.status}`);
  }

  const allApprovals = await ApprovalModel.findByRequest(requestId);
  const hodApproval       = allApprovals.find((a) => a.role === 'HOD');
  const principalApproval = allApprovals.find((a) => a.role === 'PRINCIPAL');

  let targetApproval = null;
  let requiredStep   = null;

  if (userRoles.includes('HOD')) {
    if (hodApproval?.decision !== null && hodApproval?.decision !== undefined) {
      throw new ValidationError('HOD has already acted on this request');
    }
    targetApproval = hodApproval;
    requiredStep   = 'HOD';
  } else if (userRoles.includes('PRINCIPAL')) {
    if (hodApproval?.decision !== 'APPROVED') {
      throw new ValidationError('HOD approval is required before Principal can act');
    }
    if (principalApproval?.decision !== null && principalApproval?.decision !== undefined) {
      throw new ValidationError('Principal has already acted on this request');
    }
    targetApproval = principalApproval;
    requiredStep   = 'PRINCIPAL';
  } else {
    throw new ForbiddenError('Only HOD or PRINCIPAL can approve requests');
  }

  // Record the decision
  await ApprovalModel.decide(targetApproval.id, { status, decidedBy, remarks });

  // Update overall request status
  let newRequestStatus = request.status; // keep current unless changed
  if (status === 'REJECTED') {
    newRequestStatus = 'REJECTED';
  } else if (requiredStep === 'HOD' && status === 'APPROVED') {
    newRequestStatus = 'HOD_APPROVED';
  } else if (requiredStep === 'PRINCIPAL' && status === 'APPROVED') {
    newRequestStatus = 'APPROVED';
  }
  if (newRequestStatus !== request.status) {
    await GrantRequestModel.updateStatus(requestId, newRequestStatus);
  }

  // Notify the requester
  try {
    const requester = await UserModel.findById(request.requested_by);
    if (requester?.email && newRequestStatus !== request.status) {
      await emailService.notifyRequestStatus({
        to:       requester.email,
        fullName: requester.full_name,
        grantId:  request.grant_id,
        status:   newRequestStatus,
        step:     requiredStep,
        remarks,
      });
    }
  } catch (e) {
    console.error('[EMAIL] Approval notification failed:', e.message);
  }

  return {
    step:          requiredStep,
    status,
    requestStatus: newRequestStatus,
  };
}

async function getApprovals(requestId) {
  const request = await GrantRequestModel.findById(requestId);
  if (!request) throw new NotFoundError('Grant request not found');
  const approvals = await ApprovalModel.findByRequest(requestId);
  return approvals;
}

module.exports = { decide, getApprovals };
