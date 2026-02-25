/**
 * Standardised JSON response helpers.
 */

/** 2xx success */
const ok = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

/** 201 Created */
const created = (res, data, message = 'Created') =>
  ok(res, data, message, 201);

/** 4xx client error */
const fail = (res, message = 'Bad request', statusCode = 400, errors = null) =>
  res.status(statusCode).json({ success: false, message, errors });

/** 401 */
const unauthorized = (res, message = 'Unauthorized') =>
  fail(res, message, 401);

/** 403 */
const forbidden = (res, message = 'Forbidden') =>
  fail(res, message, 403);

/** 404 */
const notFound = (res, message = 'Not found') =>
  fail(res, message, 404);

/** 500 */
const serverError = (res, message = 'Internal server error') =>
  fail(res, message, 500);

module.exports = { ok, created, fail, unauthorized, forbidden, notFound, serverError };
