# Jobman integration guide

## Local test

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe scripts\validate_registry.py
.venv\Scripts\python.exe -m pytest -q
.venv\Scripts\python.exe -m uvicorn joblab.api:app --port 5184
```

Open `http://localhost:5184/`. The service does not read Jobman's environment,
Supabase project, or frontend source.

## Add another company board

```powershell
.venv\Scripts\python.exe scripts\add_board.py --company "Example GmbH" --provider lever --identifier example --region eu
.venv\Scripts\python.exe scripts\verify_custom_boards.py
.venv\Scripts\python.exe scripts\build_company_board_registry.py
```

The command also supports Ashby, Greenhouse, SmartRecruiters, and Personio.
Workday needs `--identifier tenant|career_site --board-url URL`.
SuccessFactors needs `--board-url URL`; use `--mode legacy` for its older site
format. Only live-verified boards with German jobs become ingestion-ready.

## Curated production inputs

The repository includes two reviewed source registries:

- `data/validated_ats_sources.csv` contains ATS boards and enables only boards
  with a working adapter and verified German jobs.
- `data/bavaria_custom_career_sources.csv` contains verified company career
  pages. Only sources that produced structured German jobs in the bounded
  validation run are enabled; the others remain available for monitoring.

Run bounded local ingestion with:

```powershell
.venv\Scripts\python.exe scripts\run_registry_ingestion.py --provider personio --max-sources 5 --max-jobs 10
.venv\Scripts\python.exe scripts\run_registry_ingestion.py --provider custom_career --max-sources 6 --max-jobs 10
```

Refresh every ingestion-ready board once with:

```powershell
.venv\Scripts\python.exe scripts\refresh_registry.py --max-jobs 100
```

For a continuously running worker, repeat the refresh every six hours:

```powershell
.venv\Scripts\python.exe scripts\refresh_registry.py --max-jobs 100 --interval-hours 6
```

Only one refresh worker should run against a database at a time. In production,
run the one-shot command from the platform scheduler instead of keeping the
local loop alive.

## Merge strategy

Place this directory at `services/job-ingestion` in Jobman and preserve it as a
separate Python service. Add deployment configuration only after selecting a
worker host. Jobman should consume the normalized API contract, not import
adapter internals.

Recommended production flow:

1. A scheduled worker reads ingestion-ready registry boards.
2. Adapters fetch and normalize public jobs with bounded concurrency.
3. The worker upserts canonical jobs and source occurrences into PostgreSQL.
4. Jobman's backend reads active normalized jobs and performs user matching.
5. Diagnostics and source freshness remain private administrative data.

Review each provider's current API terms, robots rules, licensing, and data
retention requirements before production deployment.

## Supabase storage

Apply Jobman's `20260914090000_create_job_ingestion_storage.sql` migration to
the development project before setting a PostgreSQL `DATABASE_URL`. Local
SQLite creates its disposable schema automatically; PostgreSQL never does.

Use Supabase's direct or session-pooler connection string in the worker only:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@HOST:5432/postgres?sslmode=require
```

The worker automatically selects the Psycopg 3 driver. Do not use the browser's
publishable key for ingestion, and never expose the database password or
service-role key through a `VITE_` variable. Signed-in browser users can select
active jobs and company names; boards, raw payloads, and run diagnostics remain
private under row-level security.
