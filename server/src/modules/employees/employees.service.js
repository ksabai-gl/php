'use strict';

const repository = require('./employees.repository');
const { HttpError } = require('../../utils/httpError');

async function list({ deptId, q } = {}) {
  return repository.findAll({ deptId, q });
}

async function get(id) {
  const employee = await repository.findById(id);
  if (!employee) throw new HttpError(404, 'Employee not found');
  return employee;
}

async function create(input) {
  const id = await repository.insert(input);
  return { id };
}

async function modify(id, patch) {
  const existing = await repository.findById(id);
  if (!existing) throw new HttpError(404, 'Employee not found');
  const changed = await repository.update(id, patch);
  if (changed < 0) throw new HttpError(500, 'Update failed');
  return { id, changed };
}

async function destroy(id) {
  const affected = await repository.remove(id);
  if (!affected) throw new HttpError(404, 'Employee not found');
  return { id };
}

module.exports = { list, get, create, modify, destroy };
