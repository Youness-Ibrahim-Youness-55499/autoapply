import argparse
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from joblab.config import load_sources
from joblab.db import SessionLocal, init_db
from joblab.ingestion import database_counts, ingest


async def main():
    parser = argparse.ArgumentParser(description="Limited live integration test")
    parser.add_argument("--max-jobs", type=int, default=10)
    args = parser.parse_args()
    if not 1 <= args.max_jobs <= 50: parser.error("--max-jobs must be between 1 and 50")
    init_db()
    with SessionLocal() as db:
        report = await ingest(load_sources(), db, max_jobs=args.max_jobs)
        print({"raw_jobs": report.raw_jobs, "failed_sources": report.failed_sources, **database_counts(db)})
        for item in report.diagnostics: print(item.model_dump())


if __name__ == "__main__": asyncio.run(main())
