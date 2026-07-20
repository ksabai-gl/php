'use strict';

require('dotenv').config();

function required(name) {
  const v = process.env[name];
  if (!v || String(v).trim() === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

const corsOrigin = process.env.CORS_ORIGIN || '*';

const config = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8088,
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigins:
    corsOrigin === '*' ? '*' : corsOrigin.split(',').map((s) => s.trim()).filter(Boolean),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: required('DB_USER'),
    password: process.env.DB_PASS || '',
    database: required('DB_NAME'),
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  },
  apiKey: required('API_KEY'),
});

module.exports = { config };
