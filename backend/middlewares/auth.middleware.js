const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { unauthorized } = require('../utils/response');

/**
 * Verify the JWT issued by our own /auth/login endpoint.
 * Attaches req.user = { id, email, roles[] } on success.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Missing or malformed Authorization header');
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh role list on every request so revocations are respected
    const { rows } = await query(
      `SELECT r.code
         FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1`,
      [payload.sub]
    );

    req.user = {
      id:    payload.sub,
      email: payload.email,
      roles: rows.map((r) => r.code),
    };
    next();
  } catch (err) {
    return unauthorized(res, 'Invalid or expired token');
  }
}

module.exports = { authenticate };
