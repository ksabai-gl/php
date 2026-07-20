'use strict';

const pino = require('pino');
const { config } = require('./config');

const logger = pino({
  level: config.logLevel,
  base: { service: 'employee-portal-api' },
});

module.exports = { logger };
