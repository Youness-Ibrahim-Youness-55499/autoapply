# Job Database Lab

A completely isolated local prototype for ingesting German-located public jobs from ATS job boards into one canonical database. It defaults to SQLite and does not read Jobman's repository, environment, or database.

The working adapters are Ashby, Lever, Greenhouse, SmartRecruiters, Personio,
Workday, and SAP SuccessFactors. Jobs outside Germany are discarded before
persistence.

The service can later live under Jobman's `services/job-ingestion` directory
without coupling ATS code to the React frontend. See `docs/ARCHITECTURE.md` and
`docs/JOBMAN_INTEGRATION.md`.

## Setup

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

The same service can be installed as a Python package with
`pip install -e ".[test]"`, or run from the included Dockerfile.

For Supabase/PostgreSQL, apply the Jobman migration first and set the worker's
private `DATABASE_URL`. The browser never receives database or service-role
credentials. See `docs/JOBMAN_INTEGRATION.md`.

## Commands

```powershell
# Limited live test: maximum 10 records per source
.venv\Scripts\python.exe scripts\live_test.py

# Configured ingestion, capped at 50 per source by default
.venv\Scripts\python.exe scripts\run_ingestion.py --max-jobs 20

# Inspect a public career page
.venv\Scripts\python.exe scripts\inspect_source.py https://company.example/careers

# API
.venv\Scripts\python.exe -m uvicorn joblab.api:app --reload --port 5184
```

Open `http://localhost:5184/` for the test lab and
`http://localhost:5184/docs` for the interactive API.

## German company ATS registry

`config/boards.csv` is the compact, version-controlled source catalog.
Generated verification observations are written to
`data/german_company_ats_registry.json` and `.csv` and are intentionally
excluded from Git. Regenerate them with:

```powershell
.venv\Scripts\python.exe scripts\build_company_board_registry.py
```

When a generated registry is unavailable, ingestion reads enabled entries
directly from `config/boards.csv`. This makes a fresh checkout usable while
keeping large, frequently changing observations out of pull requests.

Each record contains the company, ATS provider, board identifier, board URL,
derived public API URL where known, verification status, German-job evidence,
observed job counts, sample locations, region, and last-check timestamp.
`GET /company-boards` supports `provider`, `status`, `query`, `limit`, and
`offset`. Treat counts as time-specific observations and revalidate boards
before production ingestion.

Registry status is deliberately split into independent dimensions:

- `discovery_status`: the board was found.
- `endpoint_status`: its concrete endpoint is identified, missing, or invalid.
- `query_status`: queryable, adapter-required, authentication-required,
  blocked, or untested.
- `germany_status`: verified, unverified, or currently no German jobs.
- `adapter_status`: Job Database Lab has a working adapter or still needs one.

Validate schema, state consistency, URLs, and canonical duplicates with:

```powershell
.venv\Scripts\python.exe scripts\validate_registry.py
```

Board identity is deterministic: normalized ATS provider plus board identifier,
falling back to the normalized board URL. Discovery workers use the existing
per-domain limiter (one request per second by default), and
`VerificationProgress` provides checked/verified/failed/skipped reporting.

## Add boards without changing code

```powershell
.venv\Scripts\python.exe scripts\add_board.py --company "Example GmbH" --provider lever --identifier example --region eu
.venv\Scripts\python.exe scripts\verify_custom_boards.py
.venv\Scripts\python.exe scripts\build_company_board_registry.py
```

New boards are stored in `config/custom_boards.yaml`. Verification creates
registry-compatible records; only boards with live German jobs become ready
for ingestion. Provider-specific settings live in an `options` object.

## Adding a source

Edit `config/sources.yaml`. Add the company and its ATS board identifier:

```yaml
ats_sources:
  - company: Example GmbH
    provider: greenhouse
    identifier: example-board
```

The active configuration is ATS-only. The generic adapter remains available for future controlled experiments but is not used by the German ATS registry.

## Responsible use

This prototype uses only public pages, honors robots.txt for generic sites, identifies itself with a configurable User-Agent, limits requests per domain, respects blocking status codes, and does not attempt anti-bot bypass. ATS public posting endpoints are called directly.

Production use still requires source-by-source review of terms of service, robots rules, API terms, data licensing, copyright/database rights, and GDPR obligations. Sources can be disabled in YAML with `enabled: false`.

Raw API objects are retained in `job_sources.raw_data`. Full HTML is not stored in the main job table. The optional `raw_snapshots` table exists for intentionally retained snapshots, but the live prototype does not populate it by default.
