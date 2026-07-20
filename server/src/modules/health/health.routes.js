'use strict';

const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { getPool } = require('../../db/pool');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    let dbOk = false;
    try {
      const [rows] = await getPool().query('SELECT 1 AS ok');
      dbOk = rows?.[0]?.ok === 1;
    } catch {
      dbOk = false;
    }
    res
      .status(dbOk ? 200 : 503)
      .json({ success: dbOk, service: 'employee-portal-api', db: dbOk ? 'up' : 'down', ts: new Date().toISOString() });
  })
);

module.exports = router;
