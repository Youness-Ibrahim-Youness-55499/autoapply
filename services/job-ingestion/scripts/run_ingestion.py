import argparse
import asyncio
import logging
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from joblab.config import load_sources
from joblab.db import SessionLocal, init_db
from joblab.ingestion import database_counts, ingest


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=str(ROOT / "config" / "sources.yaml"))
    parser.add_argument("--max-jobs", type=int, default=50)
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    init_db()
    with SessionLocal() as db:
        report = await ingest(load_sources(args.config), db, max_jobs=args.max_jobs)
        counts = database_counts(db)
    print("\n" + "="*49 + "\nJOB INGESTION REPORT\n" + "="*49)
    print(f"Sources configured: {len(report.diagnostics)}")
    print(f"Sources successful: {len(report.diagnostics)-report.failed_sources}")
    print(f"Sources failed: {report.failed_sources}\nRaw source jobs: {report.raw_jobs}\nCanonical jobs: {counts['canonical_jobs']}\nDuplicates merged: {report.duplicates}\nCompanies: {counts['companies']}\n")
    for row in report.diagnostics:
        print(f"{row.source}\nHTTP: {row.http_status or '-'}\nParser: {row.parser}\nDiscovered: {row.discovered} | Parsed: {row.parsed} | Failed: {row.failed}\nDuration: {row.duration_seconds:.2f}s" + (f"\nError: {row.error}" if row.error else "") + "\n")


if __name__ == "__main__": asyncio.run(main())
