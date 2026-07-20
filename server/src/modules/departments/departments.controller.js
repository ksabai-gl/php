'use strict';

const service = require('./departments.service');

async function list(req, res) {
  // Preserve legacy ?summary=1 shorthand exposed by departments.php.
  if (req.query.summary === '1') {
    const rows = await service.summary();
    return res.json({ success: true, count: rows.length, data: rows });
  }
  const rows = await service.list();
  res.json({ success: true, count: rows.length, data: rows });
}

async function summary(_req, res) {
  const rows = await service.summary();
  res.json({ success: true, count: rows.length, data: rows });
}

module.exports = { list, summary };
