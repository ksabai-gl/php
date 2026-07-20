-- Seed data for Employee Portal
USE employee_portal;

INSERT INTO departments (code, name, description) VALUES
('HR',   'Human Resources', 'People operations and payroll'),
('IT',   'Information Technology', 'Systems and applications'),
('FIN',  'Finance', 'Accounting and budgeting'),
('OPS',  'Operations', 'Day-to-day business operations');

INSERT INTO employees (emp_code, first_name, last_name, email, phone, department_id, job_title, status, hire_date) VALUES
('E001', 'Anita',  'Sharma',   'anita.sharma@example.com',  '555-0101', 1, 'HR Manager',     'ACTIVE',   '2015-03-12'),
('E002', 'Ravi',   'Kumar',    'ravi.kumar@example.com',    '555-0102', 2, 'Java Developer', 'ACTIVE',   '2016-07-01'),
('E003', 'Meera',  'Patel',    'meera.patel@example.com',   '555-0103', 2, 'PHP Developer',  'ACTIVE',   '2017-01-20'),
('E004', 'John',   'Williams', 'john.williams@example.com', '555-0104', 3, 'Accountant',     'ACTIVE',   '2014-11-05'),
('E005', 'Sara',   'Lee',      'sara.lee@example.com',      '555-0105', 4, 'Ops Lead',       'INACTIVE', '2013-09-18');