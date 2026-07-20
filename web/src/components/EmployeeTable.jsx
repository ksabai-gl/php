import { Link } from 'react-router-dom';

export default function EmployeeTable({ rows, onDelete }) {
  if (!rows.length) {
    return <p role="status">No employees found.</p>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Job Title</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((e) => (
          <tr key={e.id}>
            <td>{e.emp_code}</td>
            <td>{`${e.first_name || ''} ${e.last_name || ''}`.trim()}</td>
            <td>{e.email}</td>
            <td>{e.department_name || ''}</td>
            <td>{e.job_title || ''}</td>
            <td>{e.status}</td>
            <td>
              <Link to={`/employees/${e.id}/edit`} className="btn link">Edit</Link>
              <button type="button" className="btn link" onClick={() => onDelete(e)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
