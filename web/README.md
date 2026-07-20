# Employee Portal — React SPA (`web/`)

Vite + React 18 single-page app that replaces:

- `frontend/employee-portal/` — Liferay 6.x JSR-286 portlets (Employee List,
  Employee Form, Department Summary + `PhpApiClient`).
- `frontend/live/` — the transitional vanilla-JS UI (`app.js` + `index.html`).

## Structure

```
web/src
├── main.jsx                 # React entry
├── App.jsx                  # router
├── App.css                  # global styles (ported from frontend/live/main.css)
├── api/
│   ├── client.js            # fetch wrapper (X-API-Key + envelope handling)
│   ├── employees.js
│   └── departments.js
├── components/
│   ├── Layout.jsx           # top nav (tabs -> routes)
│   ├── EmployeeTable.jsx
│   ├── EmployeeForm.jsx
│   └── DepartmentSummary.jsx
└── pages/
    ├── EmployeesListPage.jsx
    ├── EmployeeFormPage.jsx
    └── DepartmentSummaryPage.jsx
```

## Portlet → React mapping

| Legacy portlet                                       | React equivalent                          |
|------------------------------------------------------|-------------------------------------------|
| `EmployeeListPortlet` + `employeelist/view.jsp`      | `pages/EmployeesListPage` + `EmployeeTable` |
| `EmployeeFormPortlet` + `employeeform/view.jsp`      | `pages/EmployeeFormPage` + `EmployeeForm` |
| `DepartmentSummaryPortlet` + `deptsummary/view.jsp`  | `pages/DepartmentSummaryPage` + `DepartmentSummary` |
| `PhpApiClient` (java.net.HttpURLConnection)          | `api/client.js` + `api/*.js`              |
| `PortletConfig` (portlet.properties)                 | Vite `import.meta.env.VITE_*`             |

## Running locally

```bash
cp env.example .env
npm install
npm run dev        # http://localhost:5173, /api proxied to :8088
npm test           # vitest
```
