require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const { ping } = require('./db');
const { fail } = require('./response');
const { requireApiKey } = require('./middleware/auth');
const employeeRoutes = require('./routes/employees');
const departmentRoutes = require('./routes/departments');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());
app.use(pinoHttp({ redact: ['req.headers.authorization', 'req.headers.x-api-key'] }));

app.get('/api/v1/health', (_req, res) => res.json({ success: true, status: 'ok' }));
app.get('/api/v1/ready', async (_req, res) => {
  try {
    await ping();
    res.json({ success: true, status: 'ready' });
  } catch (err) {
    fail(res, 503, 'Database unavailable');
  }
});

app.use('/api/v1/employees', requireApiKey, employeeRoutes);
app.use('/api/v1/departments', requireApiKey, departmentRoutes);

app.use((err, req, res, _next) => {
  req.log.error({ err }, 'request failed');
  fail(res, 500, 'Internal server error');
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`HR API listening on ${port}`));
