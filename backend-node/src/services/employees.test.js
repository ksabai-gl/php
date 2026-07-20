const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../db');
const employees = require('./employees');

test('MAD-138 listEmployees uses parameterized filters for department and search', async () => {
  const originalQuery = db.query;
  const calls = [];
  db.query = async (sql, params) => {
    calls.push({ sql, params });
    return [];
  };

  try {
    await employees.listEmployees({ dept: '2', q: ' Priya ' });
  } finally {
    db.query = originalQuery;
  }

  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /e\.department_id = \?/);
  assert.match(calls[0].sql, /e\.first_name LIKE \?/);
  assert.deepEqual(calls[0].params, [2, '%Priya%', '%Priya%', '%Priya%', '%Priya%']);
});

test('MAD-138 createEmployee returns validation errors without writing invalid data', async () => {
  const originalQuery = db.query;
  let queryCalled = false;
  db.query = async () => {
    queryCalled = true;
    return [];
  };

  try {
    const result = await employees.createEmployee({ email: 'bad-email' });

    assert.equal(queryCalled, false);
    assert.equal(result.validationErrors.emp_code, 'emp_code is required');
    assert.equal(result.validationErrors.email, 'email must be valid');
  } finally {
    db.query = originalQuery;
  }
});

test('MAD-138 deleteEmployee reports not-found rows from the data layer', async () => {
  const originalQuery = db.query;
  const calls = [];
  db.query = async (sql, params) => {
    calls.push({ sql, params });
    return { affectedRows: 0 };
  };

  try {
    const deleted = await employees.deleteEmployee(138);

    assert.equal(deleted, false);
    assert.deepEqual(calls, [{ sql: 'DELETE FROM employees WHERE id = ?', params: [138] }]);
  } finally {
    db.query = originalQuery;
  }
});
const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const dbPath = path.resolve(__dirname, '../db.js');
const db = require(dbPath);

function loadEmployeesWithQuery(queryImpl) {
  db.query = queryImpl;
  delete require.cache[require.resolve('./employees')];
  return require('./employees');
}

test('MAD-138 listEmployees builds parameterized filters for department and search', async () => {
  const calls = [];
  const employees = loadEmployeesWithQuery(async (sql, params) => {
    calls.push({ sql, params });
    return [{ id: 1, emp_code: 'E-001' }];
  });

  const rows = await employees.listEmployees({ dept: '3', q: '  pat  ' });

  assert.deepEqual(rows, [{ id: 1, emp_code: 'E-001' }]);
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /e\.department_id = \?/);
  assert.match(calls[0].sql, /e\.first_name LIKE \?/);
  assert.deepEqual(calls[0].params, [3, '%pat%', '%pat%', '%pat%', '%pat%']);
});

test('MAD-138 createEmployee returns field errors before database writes for invalid input', async () => {
  let writes = 0;
  const employees = loadEmployeesWithQuery(async () => {
    writes += 1;
    return { insertId: 42 };
  });

  const result = await employees.createEmployee({ emp_code: '', email: 'invalid' });

  assert.equal(writes, 0);
  assert.deepEqual(result.validationErrors, {
    emp_code: 'emp_code is required',
    first_name: 'first_name is required',
    last_name: 'last_name is required',
    email: 'email must be valid'
  });
});

test('MAD-138 updateEmployee parameterizes dynamic update fields and rejects empty patches', async () => {
  const calls = [];
  const employees = loadEmployeesWithQuery(async (sql, params) => {
    calls.push({ sql, params });
    return { affectedRows: 1 };
  });

  const emptyResult = await employees.updateEmployee(10, {});
  const updateResult = await employees.updateEmployee(10, {
    first_name: ' Priya ',
    status: 'INACTIVE'
  });

  assert.deepEqual(emptyResult.validationErrors, { request: 'No fields to update' });
  assert.deepEqual(updateResult, { id: 10 });
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /^UPDATE employees SET first_name = \?, status = \? WHERE id = \?$/);
  assert.deepEqual(calls[0].params, ['Priya', 'INACTIVE', 10]);
});
