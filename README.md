# Employee Portal (Monolith)

Traditional enterprise employee management system.

| Layer | Technology |
|-------|------------|
| Backend API | PHP 5.6 / 7.x (procedural + mysqli) |
| Frontend | Liferay Portal 6.2 / DXP 7.0 portlets (Java) |
| Database | MySQL 5.7 |
| Style | Single deployable monolith, shared config |

## Screens (3)

1. **Employee List** – browse and search employees  
2. **Employee Form** – add / edit employee  
3. **Department Summary** – headcount by department  

## APIs (5)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees.php` | List all employees (optional `?dept=`) |
| GET | `/api/employees.php?id={id}` | Get one employee |
| POST | `/api/employees.php` | Create employee |
| PUT | `/api/employees.php` | Update employee |
| DELETE | `/api/employees.php?id={id}` | Delete employee |

## Project layout

```
phpja/
├── backend/                 PHP API + shared config
│   ├── api/
│   ├── config/
│   ├── includes/
│   └── sql/
├── frontend/                Liferay portlet WAR source
│   └── employee-portal/
└── deploy/                  Sample Apache / Tomcat notes
```

## Quick start (local)

### 1. Database

```bash
mysql -u root -p < backend/sql/schema.sql
mysql -u root -p < backend/sql/seed.sql
```

### 2. PHP backend (Apache + mod_php)

Point document root (or Alias) at `backend/`:

```
http://localhost/phpja/api/employees.php
```

Edit `backend/config/database.php` for DB credentials.

### 3. Liferay frontend

1. Install Liferay Portal 6.2 CE or DXP 7.0  
2. Copy `frontend/employee-portal` into your Plugins SDK / Gradle workspace  
3. Set API base URL in `portlet.properties`  
4. Deploy the portlet WAR to Liferay  
5. Add the three portlets to a portal page  

## Notes

This is intentionally an older-style monolith: PHP scripts talk to MySQL; Liferay portlets call those PHP endpoints over HTTP on the same host (or intranet). No microservices, no SPA framework.