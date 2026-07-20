import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmployeeForm from '../components/EmployeeForm.jsx';
import { createEmployee, getEmployee, updateEmployee } from '../api/employees.js';
import { listDepartments } from '../api/departments.js';

export default function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [initial, setInitial] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listDepartments()
      .then((d) => setDepartments(d.data || []))
      .catch((e) => setErr(e.message));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getEmployee(id)
      .then((r) => setInitial(r.data))
      .catch((e) => setErr(e.message));
  }, [id, isEdit]);

  async function onSubmit(payload) {
    setBusy(true);
    setErr('');
    try {
      if (isEdit) {
        await updateEmployee(id, payload);
      } else {
        await createEmployee(payload);
      }
      navigate('/employees');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (isEdit && !initial && !err) return <p role="status">Loading…</p>;

  return (
    <>
      <h2>{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
      {err && <div className="err">{err}</div>}
      <EmployeeForm
        initial={isEdit ? initial : null}
        departments={departments}
        submitLabel={busy ? 'Saving…' : isEdit ? 'Update' : 'Create'}
        onSubmit={onSubmit}
        onCancel={() => navigate('/employees')}
      />
    </>
  );
}
