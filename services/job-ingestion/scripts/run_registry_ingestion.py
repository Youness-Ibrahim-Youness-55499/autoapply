"""Run bounded ingestion for verified boards from the canonical registry."""
import argparse
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from joblab.config import load_registry_sources
from joblab.db import SessionLocal, init_db
from joblab.ingestion import database_counts, ingest


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--provider", required=True)
    parser.add_argument("--max-sources", type=int, default=5)
    parser.add_argument("--max-jobs", type=int, default=10)
    args = parser.parse_args()
    if not 1 <= args.max_sources <= 500:
        parser.error("--max-sources must be between 1 and 500")
    if not 1 <= args.max_jobs <= 100:
        parser.error("--max-jobs must be between 1 and 100")
    sources = load_registry_sources(args.provider, args.max_sources)
    if not sources:
        parser.error(f"no ingestion-ready registry boards for {args.provider}")
    init_db()
    with SessionLocal() as db:
        report = await ingest(sources, db, max_jobs=args.max_jobs)
        print({"provider": args.provider, "sources_attempted": len(sources), "raw_jobs": report.raw_jobs, "failed_sources": report.failed_sources, **database_counts(db)})
        for diagnostic in report.diagnostics:
            print(diagnostic.model_dump())


if __name__ == "__main__":
    asyncio.run(main())
