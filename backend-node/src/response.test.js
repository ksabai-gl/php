const test = require('node:test');
const assert = require('node:assert/strict');
const { ok, created, fail } = require('./response');

function makeResponse() {
  return {
    statusCode: undefined,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
    }
  };
}

test('MAD-138 ok response preserves migrated success envelope and metadata', () => {
  const res = makeResponse();

  ok(res, [{ id: 1 }], { count: 1 });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload, { success: true, count: 1, data: [{ id: 1 }] });
});

test('MAD-138 created response preserves legacy-compatible create envelope', () => {
  const res = makeResponse();

  created(res, { message: 'Employee created', id: 138 });

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.payload, { success: true, message: 'Employee created', id: 138 });
});

test('MAD-138 fail response includes field-level validation detail when present', () => {
  const res = makeResponse();

  fail(res, 400, 'Validation failed', { email: 'email must be valid' });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.payload, {
    success: false,
    error: 'Validation failed',
    fields: { email: 'email must be valid' }
  });
});
