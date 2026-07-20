const { fail } = require('../response');

function requireApiKey(req, res, next) {
  const expected = process.env.API_KEY;
  if (!expected) return fail(res, 503, 'API key is not configured');
  if (req.get('x-api-key') !== expected) return fail(res, 401, 'Unauthorized');
  next();
}

module.exports = { requireApiKey };
