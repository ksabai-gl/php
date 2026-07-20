'use strict';

const { query } = require('../../db/pool');

async function findAll() {
  return query(
    'SELECT id, code, name, description FROM departments ORDER BY name',
    []
  );
}

async function summary() {
  return query(
    `SELECT d.id, d.code, d.name,
            COUNT(e.id) AS employee_count,
            SUM(CASE WHEN e.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id
      GROUP BY d.id, d.code, d.name
      ORDER BY d.name`,
    []
  );
}

module.exports = { findAll, summary };
