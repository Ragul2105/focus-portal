const { validationResult } = require('express-validator');
const { fail } = require('../utils/response');

/**
 * Run after express-validator rule arrays.
 * Returns 400 with formatted errors if any rules failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, 'Validation failed', 400, errors.array());
  }
  next();
};

module.exports = { validate };
