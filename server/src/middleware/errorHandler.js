'use strict';

const { HttpError } = require('../utils/httpError');
const { logger } = require('../logger');

function notFoundHandler(_req, _res, next) {
  next(new HttpError(404, 'Route not found'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const status = err instanceof HttpError ? err.status : 500;
  const payload = { success: false, error: err.message || 'Internal Server Error' };
  if (err.details) payload.details = err.details;

  if (status >= 500) {
    logger.error({ err, path: req.path }, 'unhandled error');
  } else {
    logger.warn({ status, message: err.message, path: req.path }, 'request rejected');
  }
  res.status(status).json(payload);
}

module.exports = { errorHandler, notFoundHandler };
