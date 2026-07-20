import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeTable from '../components/EmployeeTable.jsx';

const rows = [
  {
    id: 1,
    emp_code: 'E001',
    first_name: 'Anita',
    last_name: 'Sharma',
    email: 'anita@example.com',
    department_name: 'HR',
    job_title: 'HR Manager',
    status: 'ACTIVE',
  },
];

function renderTable(props = {}) {
  return render(
    <MemoryRouter>
      <EmployeeTable rows={rows} onDelete={() => {}} {...props} />
    </MemoryRouter>
  );
}

describe('EmployeeTable', () => {
  it('renders employee row with combined name', () => {
    renderTable();
    expect(screen.getByText('E001')).toBeInTheDocument();
    expect(screen.getByText('Anita Sharma')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(
      <MemoryRouter>
        <EmployeeTable rows={[]} onDelete={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByRole('status')).toHaveTextContent(/no employees/i);
  });

  it('invokes onDelete when Delete clicked', () => {
    const onDelete = vi.fn();
    renderTable({ onDelete });
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith(rows[0]);
  });
});
