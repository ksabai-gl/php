'use strict';

const crypto = require('node:crypto');
const { config } = require('../config');
const { HttpError } = require('../utils/httpError');

function readKey(req) {
  const header = req.get('x-api-key');
  if (header) return header;
  if (typeof req.query.api_key === 'string') return req.query.api_key;
  return '';
}

function constantTimeEquals(a, b) {
  const aBuf = Buffer.from(String(a), 'utf8');
  const bBuf = Buffer.from(String(b), 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function apiKey(req, _res, next) {
  const provided = readKey(req);
  if (!provided || !constantTimeEquals(provided, config.apiKey)) {
    return next(new HttpError(401, 'Invalid or missing API key'));
  }
  return next();
}

module.exports = { apiKey };
