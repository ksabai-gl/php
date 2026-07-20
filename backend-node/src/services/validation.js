const VALID_STATUS = new Set(['ACTIVE', 'INACTIVE']);

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmployee(input, partial = false) {
  const fields = {};
  const errors = {};
  const stringFields = ['emp_code', 'first_name', 'last_name', 'email', 'phone', 'job_title', 'status', 'hire_date'];

  for (const field of stringFields) {
    if (Object.prototype.hasOwnProperty.call(input, field)) fields[field] = cleanString(input[field]);
  }

  if (Object.prototype.hasOwnProperty.call(input, 'department_id')) {
    const dept = Number.parseInt(input.department_id, 10);
    fields.department_id = Number.isFinite(dept) && dept > 0 ? dept : null;
  }

  if (!partial) {
    for (const field of ['emp_code', 'first_name', 'last_name', 'email']) {
      if (!fields[field]) errors[field] = `${field} is required`;
    }
    if (!fields.status) fields.status = 'ACTIVE';
    if (!fields.hire_date) fields.hire_date = new Date().toISOString().slice(0, 10);
  }

  if (fields.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) errors.email = 'email must be valid';
  if (fields.status && !VALID_STATUS.has(fields.status)) errors.status = 'status must be ACTIVE or INACTIVE';

  return { fields, errors };
}

function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

module.exports = { normalizeEmployee, hasErrors };
