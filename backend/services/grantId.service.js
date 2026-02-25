const GrantIdModel        = require('../models/grantId.model');
const RegistrationModel   = require('../models/registration.model');
const ActivityModel       = require('../models/activityCategory.model');
const { generateGrantId } = require('../utils/idGenerator');
const { NotFoundError, ValidationError } = require('../utils/errors');
const emailService        = require('./email.service');
const UserModel           = require('../models/user.model');

/**
 * Generate a Grant / Activity ID for a given registration.
 *
 * @param {string} registrationId  UUID of the registration
 * @param {object} opts            { applicationNumber, amountGrantedInr, amountGrantedUsd }
 * @param {string} generatedBy     UUID of requesting user
 */
async function generateId(registrationId, opts = {}, generatedBy) {
  const reg = await RegistrationModel.findById(registrationId);
  if (!reg) throw new NotFoundError('Registration not found');
  if (reg.status !== 'SUBMITTED') {
    throw new ValidationError('Registration must be SUBMITTED before generating a Grant ID');
  }

  // Resolve the category code (e.g. "IEEE", "CC", "RND")
  let categoryCode = reg.category_code; // from the join
  if (!categoryCode) throw new ValidationError('Activity category not resolved');

  // Resolve the scheme code from activity detail
  let schemeCode = reg.detail_code;
  if (!schemeCode) {
    // For "OTHER" categories pick a fallback code
    schemeCode = 'OT';
  }

  const { grantId, requestNo } = await generateGrantId(categoryCode, schemeCode);

  const record = await GrantIdModel.create({
    registrationId,
    grantId,
    requestNo,
    schemeCode,
    amountGrantedInr: opts.amountGrantedInr || reg.fund_inr || null,
    amountGrantedUsd: opts.amountGrantedUsd || reg.fund_usd || null,
    generatedBy,
  });

  // Email notification
  try {
    const user = await UserModel.findById(reg.user_id);
    if (user?.email) {
      await emailService.notifyGrantIdGenerated({
        to:       user.email,
        fullName: user.full_name,
        grantId,
        regId:    reg.reg_id,
      });
    }
  } catch (e) {
    console.error('[EMAIL] Failed to send grant ID notification:', e.message);
  }

  return record;
}

async function getGrantId(id) {
  const record = await GrantIdModel.findById(id);
  if (!record) throw new NotFoundError('Grant ID not found');
  return record;
}

async function listGrantIds(filters) {
  return GrantIdModel.listAll(filters);
}

async function getByRegistration(registrationId) {
  return GrantIdModel.findByRegistrationId(registrationId);
}

module.exports = { generateId, getGrantId, listGrantIds, getByRegistration };
