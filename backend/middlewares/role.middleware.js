const { forbidden } = require('../utils/response');

/**
 * Factory that returns middleware allowing only the specified roles.
 * @param {...string} roles  e.g. requireRoles('HOD', 'PRINCIPAL')
 */
const requireRoles = (...roles) => (req, res, next) => {
  const userRoles = req.user?.roles ?? [];
  const allowed = roles.some((r) => userRoles.includes(r));
  if (!allowed) {
    return forbidden(res, `Access restricted to: ${roles.join(', ')}`);
  }
  next();
};

module.exports = { requireRoles };
