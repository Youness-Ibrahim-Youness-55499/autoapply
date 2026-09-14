# ATS ingestion architecture

This service is intentionally independent from the Jobman web application.
Jobman owns users, profiles, recommendations, and applications. This service
owns public ATS collection, German-location validation, normalization,
deduplication, and source diagnostics.

## Data flow

1. `config/custom_boards.yaml` and the generated registry describe sources.
2. `joblab.board_catalog` validates identifiers and builds endpoint URLs.
3. `joblab.adapters` converts provider responses into `RawJob` objects.
4. `joblab.location_filter` rejects jobs not established as German.
5. `joblab.ingestion` normalizes, fingerprints, and persists canonical jobs.
6. `joblab.api` exposes jobs, boards, providers, and diagnostics.

Provider code depends on the small `Adapter` contract, not on FastAPI or the
database. Adding an ATS requires one adapter, registration in
`joblab/adapters/registry.py`, fixtures, and tests. Tenant-specific quirks live
in each board's `options` object rather than shared-pipeline conditionals.

## Jobman boundary

Run this package as a separate worker/API service. Do not call every ATS from
the browser or a Supabase Edge Function. Jobman can consume normalized records
from `GET /jobs`, or a scheduled server integration can upsert them into a
dedicated Supabase jobs table. This keeps ATS failures and rate limits away
from authentication and the user-facing application.

SQLite is the local default. Production can use PostgreSQL by setting
`DATABASE_URL`; the SQLAlchemy domain model is database-independent.

## Extension rules

- Never bypass authentication, robots restrictions, or access controls.
- Keep provider HTTP and parsing logic inside its adapter.
- Preserve source payloads in `JobSource.raw_data` for debugging.
- Treat Germany verification as timestamped evidence, not a permanent fact.
- Use provider plus board identifier as canonical board identity.
- Add fixture-based tests before marking an adapter as working.
