'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

process.env.API_KEY = process.env.API_KEY || 'test-key';
process.env.DB_USER = process.env.DB_USER || 'x';
process.env.DB_NAME = process.env.DB_NAME || 'x';

const { apiKey } = require('../src/middleware/apiKey');

function mockReq({ header, query = {} } = {}) {
  return {
    get: (name) => (name.toLowerCase() === 'x-api-key' ? header : undefined),
    query,
  };
}

test('apiKey passes on valid header', () => {
  const req = mockReq({ header: 'test-key' });
  apiKey(req, {}, (err) => assert.equal(err, undefined));
});

test('apiKey passes on valid query fallback', () => {
  const req = mockReq({ query: { api_key: 'test-key' } });
  apiKey(req, {}, (err) => assert.equal(err, undefined));
});

test('apiKey rejects missing key with 401', () => {
  const req = mockReq({});
  apiKey(req, {}, (err) => {
    assert.ok(err);
    assert.equal(err.status, 401);
  });
});

test('apiKey rejects wrong key with 401', () => {
  const req = mockReq({ header: 'nope' });
  apiKey(req, {}, (err) => {
    assert.ok(err);
    assert.equal(err.status, 401);
  });
});
