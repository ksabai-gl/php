'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

process.env.API_KEY = process.env.API_KEY || 'test-key';
process.env.DB_USER = process.env.DB_USER || 'x';
process.env.DB_NAME = process.env.DB_NAME || 'x';

// Stub the repository via require cache before loading the service.
const repoPath = require.resolve('../src/modules/employees/employees.repository');
const stub = {
  __calls: [],
  findById: async (id) => {
    stub.__calls.push(['findById', id]);
    return id === 1 ? { id: 1, first_name: 'A', last_name: 'B' } : null;
  },
  findAll: async (opts) => {
    stub.__calls.push(['findAll', opts]);
    return [{ id: 1 }, { id: 2 }];
  },
  insert: async (emp) => {
    stub.__calls.push(['insert', emp]);
    return 42;
  },
  update: async (id, patch) => {
    stub.__calls.push(['update', id, patch]);
    return 1;
  },
  remove: async (id) => {
    stub.__calls.push(['remove', id]);
    return id === 1 ? 1 : 0;
  },
};
require.cache[repoPath] = { id: repoPath, filename: repoPath, loaded: true, exports: stub };

const service = require('../src/modules/employees/employees.service');

test('list forwards deptId + q to repository', async () => {
  const rows = await service.list({ deptId: 2, q: 'ra' });
  assert.equal(rows.length, 2);
  assert.deepEqual(stub.__calls.at(-1), ['findAll', { deptId: 2, q: 'ra' }]);
});

test('get returns row when found', async () => {
  const row = await service.get(1);
  assert.equal(row.id, 1);
});

test('get throws 404 when not found', async () => {
  await assert.rejects(() => service.get(9999), { status: 404 });
});

test('create returns new id', async () => {
  const out = await service.create({ emp_code: 'E100', first_name: 'X', last_name: 'Y', email: 'x@y.z' });
  assert.equal(out.id, 42);
});

test('destroy 404s when nothing deleted', async () => {
  await assert.rejects(() => service.destroy(999), { status: 404 });
});

Module._cache; // keep node happy re: unused
