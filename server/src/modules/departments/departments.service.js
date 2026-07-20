'use strict';

const repository = require('./departments.repository');

async function list() {
  return repository.findAll();
}

async function summary() {
  const rows = await repository.summary();
  return rows.map((r) => ({
    ...r,
    employee_count: Number(r.employee_count) || 0,
    active_count: Number(r.active_count) || 0,
  }));
}

module.exports = { list, summary };
