import { useEffect, useState } from 'react';

const EMPTY = {
  emp_code: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  department_id: '0',
  job_title: '',
  status: 'ACTIVE',
  hire_date: '',
};

export default function EmployeeForm({ initial, departments, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY);

  useEffect(() => {
    if (initial) {
      setValues({
        ...EMPTY,
        ...initial,
        department_id: String(initial.department_id || 0),
        hire_date: initial.hire_date || '',
      });
    }
  }, [initial]);

  function set(field) {
    return (ev) => setValues((v) => ({ ...v, [field]: ev.target.value }));
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const payload = {
      ...values,
      department_id: parseInt(values.department_id, 10) || 0,
      hire_date: values.hire_date || undefined,
    };
    onSubmit(payload);
  }

  return (
    <form className="grid" onSubmit={handleSubmit}>
      <label>Employee Code
        <input required maxLength={20} value={values.emp_code} onChange={set('emp_code')} />
      </label>
      <label>Status
        <select value={values.status} onChange={set('status')}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </label>
      <label>First Name
        <input required maxLength={80} value={values.first_name} onChange={set('first_name')} />
      </label>
      <label>Last Name
        <input required maxLength={80} value={values.last_name} onChange={set('last_name')} />
      </label>
      <label>Email
        <input required type="email" maxLength={120} value={values.email} onChange={set('email')} />
      </label>
      <label>Phone
        <input maxLength={40} value={values.phone} onChange={set('phone')} />
      </label>
      <label>Department
        <select value={values.department_id} onChange={set('department_id')}>
          <option value="0">-- Select --</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </label>
      <label>Job Title
        <input maxLength={100} value={values.job_title} onChange={set('job_title')} />
      </label>
      <label>Hire Date
        <input type="date" value={values.hire_date} onChange={set('hire_date')} />
      </label>
      <div className="actions">
        <button type="submit" className="btn">{submitLabel || 'Save'}</button>
        {onCancel && (
          <button type="button" className="btn secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
