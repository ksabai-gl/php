'use strict';

const service = require('./employees.service');
const { createSchema, updateSchema, listQuery } = require('./employees.validation');
const { HttpError } = require('../../utils/httpError');

function parseIdParam(req) {
  const raw = req.params.id ?? req.query.id ?? req.body?.id;
  const id = parseInt(raw, 10);
  if (!Number.isFinite(id) || id <= 0) {
    throw new HttpError(400, 'id is required');
  }
  return id;
}

function badRequest(err) {
  return new HttpError(400, 'Invalid request', err.flatten());
}

async function list(req, res) {
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error);
  // Support legacy `?id=` on the collection URL (PHP behavior).
  if (req.query.id) {
    const one = await service.get(parseIdParam(req));
    return res.json({ success: true, data: one });
  }
  const rows = await service.list({ deptId: parsed.data.dept, q: parsed.data.q });
  res.json({ success: true, count: rows.length, data: rows });
}

async function getOne(req, res) {
  const employee = await service.get(parseIdParam(req));
  res.json({ success: true, data: employee });
}

async function create(req, res) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  const { id } = await service.create(parsed.data);
  res.status(201).json({ success: true, message: 'Employee created', id });
}

async function update(req, res) {
  const id = parseIdParam(req);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  if (Object.keys(parsed.data).length === 0) {
    throw new HttpError(400, 'No fields to update');
  }
  await service.modify(id, parsed.data);
  res.json({ success: true, message: 'Employee updated', id });
}

async function remove(req, res) {
  const id = parseIdParam(req);
  await service.destroy(id);
  res.json({ success: true, message: 'Employee deleted', id });
}

module.exports = { list, getOne, create, update, remove };
