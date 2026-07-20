import { api } from './client.js';

export function listEmployees({ q, dept } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (dept && String(dept) !== '0') params.set('dept', dept);
  const qs = params.toString();
  return api.get(`/employees${qs ? `?${qs}` : ''}`);
}

export function getEmployee(id) {
  return api.get(`/employees/${encodeURIComponent(id)}`);
}

export function createEmployee(body) {
  return api.post('/employees', body);
}

export function updateEmployee(id, body) {
  return api.put(`/employees/${encodeURIComponent(id)}`, body);
}

export function deleteEmployee(id) {
  return api.del(`/employees/${encodeURIComponent(id)}`);
}
