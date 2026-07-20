# Migration Notes — PHP monolith → Node.js; Liferay portlets → React

Tracked by **MAD-134**. Delivered in branch
`feature/MAD-134-20260720T102900_8chnu2`.

## Scope

| Legacy artifact                                              | Replacement                                                     | Status         |
|--------------------------------------------------------------|-----------------------------------------------------------------|----------------|
| `backend/api/employees.php`                                  | `server/src/modules/employees/*`                                | Replaced       |
| `backend/api/departments.php`                                | `server/src/modules/departments/*`                              | Replaced       |
| `backend/api/health.php`                                     | `server/src/modules/health/health.routes.js`                    | Replaced       |
| `backend/includes/auth.php`                                  | `server/src/middleware/apiKey.js` (constant-time compare)       | Replaced       |
| `backend/includes/db.php`                                    | `server/src/db/pool.js` (mysql2 pool, parameterized queries)    | Replaced       |
| `backend/includes/response.php`                              | `server/src/middleware/errorHandler.js` + `res.json` envelope   | Replaced       |
| `backend/config/database.php`                                | `server/src/config/index.js` + `server/env.example` (dotenv)    | Replaced       |
| `backend/index.php` / `backend/.htaccess`                    | Express routing in `server/src/app.js`                          | Replaced       |
| `backend/sql/schema.sql` / `backend/sql/seed.sql`            | Unchanged — reused by the Node.js server                        | Preserved      |
| `frontend/employee-portal/**` (Liferay JSR-286 portlets)     | `web/src/pages/*` + `web/src/components/*` (React 18 + Vite)    | Replaced       |
| `frontend/live/app.js` + `frontend/live/index.html`          | `web/src/App.jsx` + `web/src/main.jsx`                          | Replaced       |

The legacy `backend/` and `frontend/employee-portal/` and `frontend/live/`
trees are **kept in this PR** to make the diff auditable and to allow
production cut-over on a per-consumer basis. They will be removed in a
follow-up cleanup PR once the new stack is verified in staging.

## Runtime topology

```
React SPA (web/, Vite:5173)
        │  fetch /api/**  (X-API-Key)
        ▼
Node.js API (server/, Express:8088)
        │  mysql2/promise pool (parameterized)
        ▼
MySQL — schema unchanged (backend/sql/schema.sql)
```

## Contract preservation

The Node.js API keeps the JSON envelope (`{success, data, count, error}`) and
mounts backward-compatible aliases (`/api/employees.php`,
`/api/departments.php`) so any surviving legacy client (including the retired
`PhpApiClient` in the Liferay portlet, if it is still deployed anywhere)
continues to work during the migration window.

## Security improvements landed with this migration

1. **Parameterized SQL** — eliminates the `db_escape` / `intval` string
   concatenation pattern in `backend/api/employees.php`
   (see `handle_get`, `handle_post`, `handle_put`).
2. **Constant-time API-key comparison** using `crypto.timingSafeEqual`,
   replacing the timing-sensitive `$key !== API_KEY` check in
   `backend/includes/auth.php`.
3. **Helmet + explicit CORS allow-list** instead of the wildcard
   `Access-Control-Allow-Origin: *` in `backend/includes/response.php`.
4. **Rate limiting** on `/api/**` (300 req / min per IP).
5. **Secrets moved to env** — no more `define('API_KEY', '…')` or `DB_PASS`
   hard-coded in `backend/config/database.php`.

## Local dev

```bash
# 1. Database — reuse the existing schema
mysql -u root -p < backend/sql/schema.sql
mysql -u root -p < backend/sql/seed.sql

# 2. API
cd server && cp env.example .env && npm install && npm run dev

# 3. SPA
cd web && cp env.example .env && npm install && npm run dev
# open http://localhost:5173
```

## Cut-over plan (follow-up work, not in this PR)

1. Point production reverse-proxy `/api/*` traffic at the Node.js server.
2. Serve the SPA build output from a CDN or the Node server (`vite build` →
   `web/dist`).
3. Retire the Liferay portlet WAR and delete `backend/`, `frontend/live/`,
   `frontend/employee-portal/` in a cleanup PR after two release cycles of
   parallel running.
