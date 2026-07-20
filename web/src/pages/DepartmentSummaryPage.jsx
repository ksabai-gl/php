import { useEffect, useState } from 'react';
import DepartmentSummary from '../components/DepartmentSummary.jsx';
import { departmentSummary } from '../api/departments.js';

export default function DepartmentSummaryPage() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentSummary()
      .then((r) => setRows(r.data || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h2>Department Summary</h2>
      {err && <div className="err">{err}</div>}
      {loading ? <p role="status">Loading…</p> : <DepartmentSummary rows={rows} />}
    </>
  );
}
