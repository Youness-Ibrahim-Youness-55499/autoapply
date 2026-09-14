from pathlib import Path

from joblab.models import Base


MIGRATION = Path(__file__).resolve().parents[3] / "supabase" / "migrations" / "20260914090000_create_job_ingestion_storage.sql"


def test_supabase_migration_covers_sqlalchemy_tables():
    sql = MIGRATION.read_text(encoding="utf-8").casefold()
    for table_name in Base.metadata.tables:
        assert f"create table public.{table_name}" in sql


def test_supabase_migration_keeps_worker_tables_private():
    sql = MIGRATION.read_text(encoding="utf-8").casefold()
    private_tables = ("job_boards", "job_sources", "job_ingestion_runs", "job_raw_snapshots")
    for table_name in private_tables:
        assert f"alter table public.{table_name} enable row level security" in sql
        assert f"grant select on table public.{table_name} to authenticated" not in sql
    assert 'create policy "signed-in users can read active jobs"' in sql
    assert "using (status = 'active')" in sql
