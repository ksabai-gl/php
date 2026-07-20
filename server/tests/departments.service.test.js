'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

process.env.API_KEY = process.env.API_KEY || 'test-key';
process.env.DB_USER = process.env.DB_USER || 'x';
process.env.DB_NAME = process.env.DB_NAME || 'x';

const repoPath = require.resolve('../src/modules/departments/departments.repository');
const stub = {
  findAll: async () => [{ id: 1, code: 'HR', name: 'Human Resources' }],
  summary: async () => [
    { id: 1, code: 'HR', name: 'Human Resources', employee_count: '3', active_count: '2' },
  ],
};
require.cache[repoPath] = { id: repoPath, filename: repoPath, loaded: true, exports: stub };

const service = require('../src/modules/departments/departments.service');

test('list returns rows from repository', async () => {
  const rows = await service.list();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].code, 'HR');
});

test('summary casts numeric counts', async () => {
  const rows = await service.summary();
  assert.strictEqual(rows[0].employee_count, 3);
  assert.strictEqual(rows[0].active_count, 2);
});
