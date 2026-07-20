const express = require('express');
const { ok, created, fail } = require('../response');
const employees = require('../services/employees');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (req.query.id) {
      const employee = await employees.getEmployee(Number.parseInt(req.query.id, 10));
      if (!employee) return fail(res, 404, 'Employee not found');
      return ok(res, employee);
    }
    const rows = await employees.listEmployees({ dept: req.query.dept, q: req.query.q });
    return ok(res, rows, { count: rows.length });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const result = await employees.createEmployee(req.body || {});
    if (result.validationErrors) return fail(res, 400, 'Validation failed', result.validationErrors);
    return created(res, { message: 'Employee created', id: result.id });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const id = Number.parseInt((req.body && req.body.id) || req.query.id, 10);
    if (!id) return fail(res, 400, 'id is required', { id: 'id is required' });
    const result = await employees.updateEmployee(id, req.body || {});
    if (result.validationErrors) return fail(res, 400, 'Validation failed', result.validationErrors);
    return ok(res, { id }, { message: 'Employee updated' });
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const id = Number.parseInt(req.query.id || (req.body && req.body.id), 10);
    if (!id) return fail(res, 400, 'id is required', { id: 'id is required' });
    const deleted = await employees.deleteEmployee(id);
    if (!deleted) return fail(res, 404, 'Employee not found');
    return ok(res, { id }, { message: 'Employee deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
