# Employee Portal — Node.js API (`server/`)

Modular Express.js API that replaces the legacy PHP monolith under `backend/`.

## Architecture

```
server/src
├── server.js                # entrypoint, boots HTTP server
├── app.js                   # express app + middleware wiring
├── config/index.js          # 12-factor env loader (dotenv + validation)
├── db/pool.js               # mysql2/promise connection pool
├── middleware/
│   ├── apiKey.js            # X-API-Key auth (backward-compatible)
│   └── errorHandler.js      # centralized error -> JSON
├── utils/
│   ├── asyncHandler.js
│   └── httpError.js
└── modules/
    ├── employees/           # routes / controller / service / repository / validation
    ├── departments/
    └── health/
```

Each feature module owns its layers — routes wire HTTP, the controller does I/O
translation, the service holds business rules, and the repository owns SQL.
This removes the fat-request-handler pattern from `backend/api/employees.php`
and eliminates the mixed-concern helpers in `backend/includes/`.

## REST contract

Preserved from the legacy PHP endpoints so the React SPA and any remaining
consumers keep working.

| Method | Path (new)                      | Legacy alias                          |
|--------|---------------------------------|---------------------------------------|
| GET    | `/api/employees`                | `/api/employees.php`                  |
| GET    | `/api/employees/:id`            | `/api/employees.php?id=N`             |
| POST   | `/api/employees`                | `/api/employees.php`                  |
| PUT    | `/api/employees/:id`            | `/api/employees.php` (id in body)     |
| DELETE | `/api/employees/:id`            | `/api/employees.php?id=N`             |
| GET    | `/api/departments`              | `/api/departments.php`                |
| GET    | `/api/departments/summary`      | `/api/departments.php?summary=1`      |
| GET    | `/api/health`                   | `/api/health.php`                     |

All responses use the same envelope as the legacy PHP layer:

```json
{ "success": true, "count": 5, "data": [...] }
{ "success": false, "error": "message" }
```

## Security fixes vs. legacy PHP

1. **SQL injection**: legacy handlers concatenated `intval()`/`db_escape()` into
   raw SQL. This module uses `mysql2/promise` parameterized queries and never
   interpolates user input into SQL.
2. **Constant-time API key comparison**: `crypto.timingSafeEqual` replaces the
   `$key !== API_KEY` string compare.
3. **Helmet + rate-limit** on all `/api` routes.
4. **CORS allow-list** replaces the wildcard `Access-Control-Allow-Origin: *`.

## Running locally

```bash
cp env.example .env    # rename dotfile if your OS blocks .env creation
npm install
npm run dev            # nodemon, port 8088
npm test               # node --test tests/*.test.js
```

The database schema is unchanged — reuse `backend/sql/schema.sql` and
`backend/sql/seed.sql` from the repository root.
