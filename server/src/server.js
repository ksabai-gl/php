'use strict';

const { config } = require('./config');
const { logger } = require('./logger');
const { createApp } = require('./app');
const { closePool } = require('./db/pool');

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(
    { port: config.port, env: config.env },
    'Employee Portal API listening'
  );
});

async function shutdown(signal) {
  logger.info({ signal }, 'shutdown initiated');
  server.close(async (err) => {
    if (err) logger.error({ err }, 'error closing http server');
    try {
      await closePool();
    } catch (e) {
      logger.error({ err: e }, 'error closing db pool');
    }
    process.exit(err ? 1 : 0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'unhandled rejection');
});
