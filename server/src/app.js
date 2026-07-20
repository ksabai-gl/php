'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');

const { config } = require('./config');
const { logger } = require('./logger');
const { apiKey } = require('./middleware/apiKey');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const employeesRoutes = require('./modules/employees/employees.routes');
const departmentsRoutes = require('./modules/departments/departments.routes');
const healthRoutes = require('./modules/health/health.routes');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-API-Key'],
    })
  );
  app.use(express.json({ limit: '256kb' }));
  app.use(pinoHttp({ logger }));
  app.use(
    '/api',
    rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false })
  );

  app.use('/api/health', healthRoutes);

  app.use('/api', apiKey);

  app.use('/api/employees', employeesRoutes);
  app.use('/api/departments', departmentsRoutes);

  // Backward-compatible aliases for legacy PHP consumers still in the wild.
  app.use('/api/employees.php', employeesRoutes);
  app.use('/api/departments.php', departmentsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
