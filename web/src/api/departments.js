import { api } from './client.js';

export function listDepartments() {
  return api.get('/departments');
}

export function departmentSummary() {
  return api.get('/departments/summary');
}
