const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const dbPath = path.resolve(__dirname, '../db.js');
const db = require(dbPath);

function loadDepartmentsWithQuery(queryImpl) {
  db.query = queryImpl;
  delete require.cache[require.resolve('./departments')];
  return require('./departments');
}

test('MAD-138 listDepartments returns active lookup rows ordered by name query', async () => {
  const calls = [];
  const departments = loadDepartmentsWithQuery(async (sql, params) => {
    calls.push({ sql, params });
    return [{ id: 2, code: 'ENG', name: 'Engineering', description: 'Product engineering' }];
  });

  const rows = await departments.listDepartments();

  assert.deepEqual(rows, [{ id: 2, code: 'ENG', name: 'Engineering', description: 'Product engineering' }]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, 'SELECT id, code, name, description FROM departments ORDER BY name');
  assert.deepEqual(calls[0].params, []);
});

test('MAD-138 departmentSummary uses server-derived employee counts', async () => {
  const calls = [];
  const departments = loadDepartmentsWithQuery(async (sql, params) => {
    calls.push({ sql, params });
    return [{ id: 2, code: 'ENG', name: 'Engineering', employee_count: 3, active_count: 2 }];
  });

  const rows = await departments.departmentSummary();

  assert.deepEqual(rows, [{ id: 2, code: 'ENG', name: 'Engineering', employee_count: 3, active_count: 2 }]);
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /COUNT\(e\.id\) AS employee_count/);
  assert.match(calls[0].sql, /SUM\(CASE WHEN e\.status = 'ACTIVE' THEN 1 ELSE 0 END\) AS active_count/);
  assert.match(calls[0].sql, /LEFT JOIN employees e ON e\.department_id = d\.id/);
  assert.deepEqual(calls[0].params, []);
});
