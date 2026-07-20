const { query } = require('../db');
const { normalizeEmployee, hasErrors } = require('./validation');

const EMPLOYEE_COLUMNS = `e.id, e.emp_code, e.first_name, e.last_name, e.email,
  e.phone, e.department_id, d.name AS department_name,
  e.job_title, e.status, e.hire_date, e.created_at`;

async function listEmployees(filters) {
  const where = [];
  const params = [];
  if (filters.dept) {
    where.push('e.department_id = ?');
    params.push(Number.parseInt(filters.dept, 10));
  }
  if (filters.q) {
    where.push('(e.first_name LIKE ? OR e.last_name LIKE ? OR e.emp_code LIKE ? OR e.email LIKE ?)');
    const like = `%${filters.q.trim()}%`;
    params.push(like, like, like, like);
  }
  const rows = await query(
    `SELECT ${EMPLOYEE_COLUMNS} FROM employees e LEFT JOIN departments d ON d.id = e.department_id ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY e.last_name, e.first_name`,
    params
  );
  return rows;
}

async function getEmployee(id) {
  const rows = await query(`SELECT ${EMPLOYEE_COLUMNS} FROM employees e LEFT JOIN departments d ON d.id = e.department_id WHERE e.id = ?`, [id]);
  return rows[0] || null;
}

async function createEmployee(body) {
  const { fields, errors } = normalizeEmployee(body);
  if (hasErrors(errors)) return { validationErrors: errors };
  const result = await query(
    `INSERT INTO employees (emp_code, first_name, last_name, email, phone, department_id, job_title, status, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [fields.emp_code, fields.first_name, fields.last_name, fields.email, fields.phone || '', fields.department_id, fields.job_title || '', fields.status, fields.hire_date]
  );
  return { id: result.insertId };
}

async function updateEmployee(id, body) {
  const { fields, errors } = normalizeEmployee(body, true);
  if (hasErrors(errors)) return { validationErrors: errors };
  const allowed = ['emp_code', 'first_name', 'last_name', 'email', 'phone', 'department_id', 'job_title', 'status', 'hire_date'];
  const updates = allowed.filter((field) => Object.prototype.hasOwnProperty.call(fields, field));
  if (!updates.length) return { validationErrors: { request: 'No fields to update' } };
  const params = updates.map((field) => fields[field]);
  params.push(id);
  await query(`UPDATE employees SET ${updates.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`, params);
  return { id };
}

async function deleteEmployee(id) {
  const result = await query('DELETE FROM employees WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { listEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee };
