const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeEmployee, hasErrors } = require('./validation');

test('MAD-138 normalizeEmployee defaults create fields and trims user input', () => {
  const originalDate = Date;
  global.Date = class extends originalDate {
    constructor(...args) {
      return args.length ? new originalDate(...args) : new originalDate('2026-07-20T08:12:01.106Z');
    }

    static now() {
      return new originalDate('2026-07-20T08:12:01.106Z').getTime();
    }

    static parse(value) {
      return originalDate.parse(value);
    }

    static UTC(...args) {
      return originalDate.UTC(...args);
    }
  };

  try {
    const { fields, errors } = normalizeEmployee({
      emp_code: ' E-138 ',
      first_name: ' Maya ',
      last_name: ' Das ',
      email: ' maya.das@example.com ',
      department_id: '2'
    });

    assert.deepEqual(errors, {});
    assert.equal(fields.emp_code, 'E-138');
    assert.equal(fields.status, 'ACTIVE');
    assert.equal(fields.hire_date, '2026-07-20');
    assert.equal(fields.department_id, 2);
  } finally {
    global.Date = originalDate;
  }
});

test('MAD-138 normalizeEmployee reports required and field-level validation errors', () => {
  const { errors } = normalizeEmployee({
    emp_code: '',
    first_name: '',
    last_name: 'Das',
    email: 'invalid-email',
    status: 'PAUSED'
  });

  assert.equal(errors.emp_code, 'emp_code is required');
  assert.equal(errors.first_name, 'first_name is required');
  assert.equal(errors.email, 'email must be valid');
  assert.equal(errors.status, 'status must be ACTIVE or INACTIVE');
  assert.equal(hasErrors(errors), true);
});

test('MAD-138 partial employee updates reject empty change sets', () => {
  const { fields, errors } = normalizeEmployee({}, true);

  assert.deepEqual(fields, {});
  assert.deepEqual(errors, {});
  assert.equal(hasErrors(errors), false);
});
const assert = require('node:assert/strict');
const test = require('node:test');

const { normalizeEmployee, hasErrors } = require('./validation');

test('MAD-138 create validation applies deterministic legacy-compatible defaults', (t) => {
  const RealDate = Date;
  t.after(() => {
    global.Date = RealDate;
  });
  global.Date = class extends RealDate {
    constructor(...args) {
      return args.length ? new RealDate(...args) : new RealDate('2026-07-20T08:06:18.526Z');
    }

    static now() {
      return new RealDate('2026-07-20T08:06:18.526Z').getTime();
    }
  };

  const { fields, errors } = normalizeEmployee({
    emp_code: 'E-138',
    first_name: 'Maya',
    last_name: 'Das',
    email: 'maya.das@example.com'
  });

  assert.deepEqual(errors, {});
  assert.equal(fields.status, 'ACTIVE');
  assert.equal(fields.hire_date, '2026-07-20');
});

test('MAD-138 create validation requires core employee identity fields', () => {
  const { fields, errors } = normalizeEmployee({
    emp_code: '   ',
    first_name: '',
    last_name: 'Ng',
    email: 'bad-email'
  });

  assert.equal(fields.status, 'ACTIVE');
  assert.match(fields.hire_date, /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(errors, {
    emp_code: 'emp_code is required',
    first_name: 'first_name is required',
    email: 'email must be valid'
  });
  assert.equal(hasErrors(errors), true);
});

test('MAD-138 create validation trims input and applies deterministic defaults shape', () => {
  const { fields, errors } = normalizeEmployee({
    emp_code: ' E-100 ',
    first_name: ' Ana ',
    last_name: ' Patel ',
    email: ' ana.patel@example.com ',
    department_id: '7'
  });

  assert.equal(hasErrors(errors), false);
  assert.equal(fields.emp_code, 'E-100');
  assert.equal(fields.first_name, 'Ana');
  assert.equal(fields.last_name, 'Patel');
  assert.equal(fields.email, 'ana.patel@example.com');
  assert.equal(fields.department_id, 7);
  assert.equal(fields.status, 'ACTIVE');
  assert.match(fields.hire_date, /^\d{4}-\d{2}-\d{2}$/);
});

test('MAD-138 partial update validation rejects invalid status without requiring create-only fields', () => {
  const { fields, errors } = normalizeEmployee({ status: 'SUSPENDED' }, true);

  assert.deepEqual(fields, { status: 'SUSPENDED' });
  assert.deepEqual(errors, { status: 'status must be ACTIVE or INACTIVE' });
});
