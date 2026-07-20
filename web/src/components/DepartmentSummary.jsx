export default function DepartmentSummary({ rows }) {
  if (!rows.length) return <p role="status">No department data.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Employees</th>
          <th>Active</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((d) => (
          <tr key={d.id}>
            <td>{d.code}</td>
            <td>{d.name}</td>
            <td>{d.employee_count}</td>
            <td>{d.active_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
