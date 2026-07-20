const assert = require('node:assert/strict');
const test = require('node:test');

const { requireApiKey } = require('./auth');

function makeResponse() {
  return {
    statusCode: 0,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

test('MAD-138 requireApiKey rejects missing server configuration with standard error envelope', (t) => {
  const previous = process.env.API_KEY;
  t.after(() => {
    if (previous === undefined) delete process.env.API_KEY;
    else process.env.API_KEY = previous;
  });
  delete process.env.API_KEY;
  const res = makeResponse();
  let nextCalled = false;

  requireApiKey({ get: () => undefined }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, { success: false, error: 'API key is not configured' });
});

test('MAD-138 requireApiKey enforces x-api-key without leaking expected secret', (t) => {
  const previous = process.env.API_KEY;
  t.after(() => {
    if (previous === undefined) delete process.env.API_KEY;
    else process.env.API_KEY = previous;
  });
  process.env.API_KEY = 'server-only-secret';
  const res = makeResponse();
  let nextCalled = false;

  requireApiKey({ get: () => 'wrong-secret' }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { success: false, error: 'Unauthorized' });
  assert.doesNotMatch(JSON.stringify(res.body), /server-only-secret/);
});

test('MAD-138 requireApiKey allows authorized API calls', (t) => {
  const previous = process.env.API_KEY;
  t.after(() => {
    if (previous === undefined) delete process.env.API_KEY;
    else process.env.API_KEY = previous;
  });
  process.env.API_KEY = 'server-only-secret';
  const res = makeResponse();
  let nextCalled = false;

  requireApiKey({ get: () => 'server-only-secret' }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 0);
  assert.equal(res.body, null);
});
