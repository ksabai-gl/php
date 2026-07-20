import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';
const blankEmployee = { id: 0, emp_code: '', first_name: '', last_name: '', email: '', phone: '', department_id: 0, job_title: '', status: 'ACTIVE', hire_date: '' };

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.success === false) {
    const error = new Error(data?.error || `HTTP ${res.status}`);
    error.fields = data?.fields || {};
    throw error;
  }
  return data;
}

export function App() {
  const [tab, setTab] = useState('list');
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState([]);
  const [filters, setFilters] = useState({ q: '', dept: '0' });
  const [form, setForm] = useState(blankEmployee);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const departmentName = useMemo(() => Object.fromEntries(departments.map((d) => [String(d.id), d.name])), [departments]);

  async function loadDepartments() {
    const data = await api('/departments');
    setDepartments(data.data || []);
  }

  async function loadEmployees() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.q.trim()) params.set('q', filters.q.trim());
      if (filters.dept !== '0') params.set('dept', filters.dept);
      const data = await api(`/employees?${params.toString()}`);
      setEmployees(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/departments?summary=1');
      setSummary(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments().then(loadEmployees).catch((err) => setError(`Could not reach API: ${err.message}`));
  }, []);

  useEffect(() => {
    if (tab === 'summary') loadSummary();
  }, [tab]);

  function editEmployee(employee) {
    setForm({ ...blankEmployee, ...employee, department_id: employee.department_id || 0 });
    setFieldErrors({});
    setTab('form');
  }

  async function deleteEmployee(id) {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await api(`/employees?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setMessage('Employee deleted');
      await loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveEmployee(event) {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    const body = { ...form, department_id: Number.parseInt(form.department_id, 10) || 0, hire_date: form.hire_date || undefined };
    try {
      if (body.id > 0) {
        await api('/employees', { method: 'PUT', body: JSON.stringify(body) });
        setMessage('Employee updated');
      } else {
        await api('/employees', { method: 'POST', body: JSON.stringify(body) });
        setMessage('Employee created');
        setForm(blankEmployee);
      }
      setTab('list');
      await loadEmployees();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fields || {});
    }
  }

  return <main className="shell">
    <h1>HR Platform</h1>
    {message && <p className="success" role="status">{message}</p>}
    {error && <p className="error" role="alert">{error}</p>}
    <nav aria-label="Primary">
      {['list', 'form', 'summary'].map((name) => <button key={name} className={tab === name ? 'active' : ''} onClick={() => setTab(name)}>{name === 'list' ? 'Employees' : name === 'form' ? (form.id ? 'Edit Employee' : 'Add Employee') : 'Department Summary'}</button>)}
    </nav>

    {tab === 'list' && <section>
      <form className="filters" onSubmit={(e) => { e.preventDefault(); loadEmployees(); }}>
        <input aria-label="Search employees" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Search" />
        <select aria-label="Department filter" value={filters.dept} onChange={(e) => setFilters({ ...filters, dept: e.target.value })}>
          <option value="0">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button type="submit">Apply</button>
      </form>
      <table><thead><tr><th>Code</th><th>Name</th><th>Email</th><th>Department</th><th>Job Title</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="7">Loading...</td></tr> : employees.length ? employees.map((e) => <tr key={e.id}><td>{e.emp_code}</td><td>{e.first_name} {e.last_name}</td><td>{e.email}</td><td>{e.department_name || departmentName[String(e.department_id)]}</td><td>{e.job_title}</td><td>{e.status}</td><td><button onClick={() => editEmployee(e)}>Edit</button><button onClick={() => deleteEmployee(e.id)}>Delete</button></td></tr>) : <tr><td colSpan="7">No employees found.</td></tr>}
      </tbody></table>
    </section>}

    {tab === 'form' && <form className="card" onSubmit={saveEmployee}>
      {[['emp_code', 'Employee code'], ['first_name', 'First name'], ['last_name', 'Last name'], ['email', 'Email'], ['phone', 'Phone'], ['job_title', 'Job title'], ['hire_date', 'Hire date']].map(([key, label]) => <label key={key}>{label}<input type={key === 'email' ? 'email' : key === 'hire_date' ? 'date' : 'text'} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />{fieldErrors[key] && <span className="field-error">{fieldErrors[key]}</span>}</label>)}
      <label>Department<select value={form.department_id || 0} onChange={(e) => setForm({ ...form, department_id: e.target.value })}><option value="0">-- Select --</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
      <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>ACTIVE</option><option>INACTIVE</option></select>{fieldErrors.status && <span className="field-error">{fieldErrors.status}</span>}</label>
      <button type="submit">{form.id ? 'Update' : 'Create'}</button><button type="button" onClick={() => { setForm(blankEmployee); setFieldErrors({}); }}>Reset</button>
    </form>}

    {tab === 'summary' && <section><table><thead><tr><th>Code</th><th>Name</th><th>Employees</th><th>Active</th></tr></thead><tbody>{loading ? <tr><td colSpan="4">Loading...</td></tr> : summary.length ? summary.map((d) => <tr key={d.id}><td>{d.code}</td><td>{d.name}</td><td>{d.employee_count}</td><td>{d.active_count || 0}</td></tr>) : <tr><td colSpan="4">No department data.</td></tr>}</tbody></table></section>}
  </main>;
}

if (document.getElementById('root')) {
  createRoot(document.getElementById('root')).render(<App />);
}
