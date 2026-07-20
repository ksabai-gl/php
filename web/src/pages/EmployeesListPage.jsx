import { useCallback, useEffect, useState } from 'react';
import EmployeeTable from '../components/EmployeeTable.jsx';
import { deleteEmployee, listEmployees } from '../api/employees.js';
import { listDepartments } from '../api/departments.js';

export default function EmployeesListPage() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('0');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await listEmployees({ q: q.trim(), dept });
      setRows(data.data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, dept]);

  useEffect(() => {
    listDepartments()
      .then((d) => setDepartments(d.data || []))
      .catch((e) => setErr(e.message));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function onDelete(emp) {
    if (!window.confirm(`Delete ${emp.first_name} ${emp.last_name}?`)) return;
    try {
      await deleteEmployee(emp.id);
      setMsg('Employee deleted');
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <>
      {msg && <div className="msg">{msg}</div>}
      {err && <div className="err">{err}</div>}
      <form
        className="filters"
        onSubmit={(ev) => { ev.preventDefault(); load(); }}
      >
        <input
          placeholder="Search name / code / email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="0">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <button className="btn" type="submit">Filter</button>
      </form>
      {loading ? <p role="status">Loading…</p> : <EmployeeTable rows={rows} onDelete={onDelete} />}
    </>
  );
}
