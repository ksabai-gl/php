import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import EmployeesListPage from './pages/EmployeesListPage.jsx';
import EmployeeFormPage from './pages/EmployeeFormPage.jsx';
import DepartmentSummaryPage from './pages/DepartmentSummaryPage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<EmployeesListPage />} />
        <Route path="/employees/new" element={<EmployeeFormPage />} />
        <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
        <Route path="/departments" element={<DepartmentSummaryPage />} />
        <Route path="*" element={<Navigate to="/employees" replace />} />
      </Routes>
    </Layout>
  );
}
