---
name: db-query
description: Use this skill when the user asks to query the database, inspect table data, check user records, debug data state, or write SQL for the Vitamind PostgreSQL database. Also use when asked about the database schema or relationships.
---

# Database Query - Vitamind

## Goal
Safely query or inspect the local Vitamind PostgreSQL database to retrieve data, debug issues, or understand the schema.

## Database Connection
Local dev connection (from `.env`):
- Host: `127.0.0.1`
- Port: `5432`
- Database: `vitamind`
- Username: `vitamind`
- Password: `vitamind`

Docker network (app -> db service):
- Host: `db`
- Port: `5432`

pgAdmin UI (if running): http://127.0.0.1:5050
- Email: `admin@app.vitamind.com.vn`
- Password: value from `.env`

## Instructions

1. Understand the request and identify what data or schema info is needed.
2. Formulate a safe SQL query. Use `SELECT` only for inspection.
3. Run via `psql` or node script.

### Run a query via psql (PowerShell)
```powershell
$env:PGPASSWORD="vitamind"; psql -h 127.0.0.1 -p 5432 -U vitamind -d vitamind -c "SELECT ..."
```

### Inspect table list
```powershell
$env:PGPASSWORD="vitamind"; psql -h 127.0.0.1 -p 5432 -U vitamind -d vitamind -c "\dt"
```

### Inspect a table schema
```powershell
$env:PGPASSWORD="vitamind"; psql -h 127.0.0.1 -p 5432 -U vitamind -d vitamind -c "\d table_name"
```

4. Present results as a Markdown table when the result has columns.
5. If result > 50 rows, summarize instead of listing all rows.

## Constraints
- ONLY `SELECT` statements for data inspection. Never `DROP`, `DELETE`, `UPDATE`, or `INSERT` without explicit user confirmation.
- Never expose raw passwords or API keys found in the database.
- The `lib/db/` directory contains database helpers; check there before writing raw queries.
