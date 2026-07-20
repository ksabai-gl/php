import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { App } from './main.jsx';

const departments = [
  { id: 2, code: 'ENG', name: 'Engineering', description: 'Product engineering' }
];

const employees = [
  {
    id: 10,
    emp_code: 'E-010',
    first_name: 'Priya',
    last_name: 'Raman',
    email: 'priya.raman@example.com',
    department_id: 2,
    job_title: 'HR Analyst',
    status: 'ACTIVE'
  }
];

beforeEach(() => {
  global.fetch = vi.fn(async (url) => {
    if (url.endsWith('/departments')) {
      return { ok: true, json: async () => ({ success: true, data: departments }) };
    }
    if (url.includes('/employees')) {
      return { ok: true, json: async () => ({ success: true, data: employees }) };
    }
    return { ok: false, status: 404, json: async () => ({ success: false, error: 'Not found' }) };
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test('MAD-138 renders employee list with department data from the migrated API', async () => {
  render(<App />);

  expect(await screen.findByText('Priya Raman')).toBeInTheDocument();
  expect(screen.getByText('Engineering')).toBeInTheDocument();
  expect(screen.getByText('HR Analyst')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('/api/v1/departments', expect.any(Object));
  expect(global.fetch).toHaveBeenCalledWith('/api/v1/employees?', expect.any(Object));
});

test('MAD-138 shows a reachable API error state without exposing secrets', async () => {
  global.fetch = vi.fn(async () => ({
    ok: false,
    status: 401,
    json: async () => ({ success: false, error: 'Unauthorized' })
  }));

  render(<App />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach API: Unauthorized');
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/v1/departments', expect.any(Object)));
  expect(JSON.stringify(global.fetch.mock.calls)).not.toContain('API_KEY');
});
