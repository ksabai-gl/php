const assert = require('node:assert/strict');
const test = require('node:test');

const { normalizeEmployee, hasErrors } = require('./validation');

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
