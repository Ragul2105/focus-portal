const authService = require('../services/auth.service');
const { ok, fail } = require('../utils/response');

async function login(req, res, next) {
  try {
    const { firebaseToken } = req.body;
    const result = await authService.loginWithFirebase(firebaseToken);
    return ok(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  return ok(res, req.user);
}

module.exports = { login, me };
