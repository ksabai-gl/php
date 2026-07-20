const express = require('express');
const { ok } = require('../response');
const departments = require('../services/departments');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const rows = req.query.summary === '1' ? await departments.departmentSummary() : await departments.listDepartments();
    ok(res, rows, { count: rows.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
