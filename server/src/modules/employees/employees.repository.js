'use strict';

const { query } = require('../../db/pool');

const BASE_SELECT = `
  SELECT e.id, e.emp_code, e.first_name, e.last_name, e.email,
         e.phone, e.department_id, d.name AS department_name,
         e.job_title, e.status, e.hire_date, e.created_at
  FROM employees e
  LEFT JOIN departments d ON d.id = e.department_id
`;

async function findById(id) {
  const rows = await query(`${BASE_SELECT} WHERE e.id = ?`, [id]);
  return rows[0] || null;
}

async function findAll({ deptId, q } = {}) {
  const clauses = [];
  const params = [];

  if (deptId) {
    clauses.push('e.department_id = ?');
    params.push(deptId);
  }
  if (q) {
    clauses.push(
      '(e.first_name LIKE ? OR e.last_name LIKE ? OR e.emp_code LIKE ? OR e.email LIKE ?)'
    );
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `${BASE_SELECT} ${where} ORDER BY e.last_name, e.first_name`;
  return query(sql, params);
}

async function insert(emp) {
  const sql = `
    INSERT INTO employees
      (emp_code, first_name, last_name, email, phone, department_id, job_title, status, hire_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    emp.emp_code,
    emp.first_name,
    emp.last_name,
    emp.email,
    emp.phone || null,
    emp.department_id > 0 ? emp.department_id : null,
    emp.job_title || null,
    emp.status || 'ACTIVE',
    emp.hire_date || null,
  ];
  const result = await query(sql, params);
  return result.insertId;
}

async function update(id, patch) {
  const cols = [];
  const params = [];
  const scalarFields = [
    'emp_code',
    'first_name',
    'last_name',
    'email',
    'phone',
    'job_title',
    'status',
    'hire_date',
  ];
  for (const col of scalarFields) {
    if (Object.prototype.hasOwnProperty.call(patch, col)) {
      cols.push(`${col} = ?`);
      params.push(patch[col]);
    }
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'department_id')) {
    cols.push('department_id = ?');
    params.push(patch.department_id > 0 ? patch.department_id : null);
  }
  if (!cols.length) return 0;
  params.push(id);
  const result = await query(`UPDATE employees SET ${cols.join(', ')} WHERE id = ?`, params);
  return result.affectedRows;
}

async function remove(id) {
  const result = await query('DELETE FROM employees WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = { findById, findAll, insert, update, remove };
