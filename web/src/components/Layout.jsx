import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/employees', label: 'Employees' },
  { to: '/employees/new', label: 'Add Employee' },
  { to: '/departments', label: 'Department Summary' },
];

export default function Layout({ children }) {
  return (
    <div className="app">
      <h1>Employee Portal</h1>
      <nav className="tabs">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end
            className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <div className="panel">{children}</div>
    </div>
  );
}
