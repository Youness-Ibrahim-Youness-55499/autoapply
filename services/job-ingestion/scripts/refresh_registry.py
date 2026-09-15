"""Refresh every ingestion-ready ATS board and custom career source."""
import argparse
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from joblab.config import load_custom_career_sources, load_registry_sources
from joblab.db import SessionLocal, init_db
from joblab.ingestion import database_counts, ingest
from joblab.providers import PROVIDERS


async def refresh(max_jobs: int, max_sources: int | None) -> None:
    working_providers = [item["id"] for item in PROVIDERS if item["status"] == "working"]
    init_db()
    with SessionLocal() as db:
        for provider in [*working_providers, "custom_career"]:
            sources = (
                load_custom_career_sources(max_sources)
                if provider == "custom_career"
                else load_registry_sources(provider, max_sources)
            )
            if not sources:
                continue
            report = await ingest(sources, db, max_jobs=max_jobs)
            print(
                {
                    "provider": provider,
                    "sources_attempted": len(sources),
                    "raw_jobs": report.raw_jobs,
                    "failed_sources": report.failed_sources,
                    **database_counts(db),
                },
                flush=True,
            )


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-jobs", type=int, default=100)
    parser.add_argument("--max-sources-per-provider", type=int)
    parser.add_argument(
        "--interval-hours",
        type=float,
        default=0,
        help="Repeat after this many hours; zero runs exactly once.",
    )
    args = parser.parse_args()
    if not 1 <= args.max_jobs <= 100:
        parser.error("--max-jobs must be between 1 and 100")
    if args.max_sources_per_provider is not None and not 1 <= args.max_sources_per_provider <= 500:
        parser.error("--max-sources-per-provider must be between 1 and 500")
    if args.interval_hours < 0:
        parser.error("--interval-hours cannot be negative")

    while True:
        await refresh(args.max_jobs, args.max_sources_per_provider)
        if args.interval_hours == 0:
            return
        await asyncio.sleep(args.interval_hours * 60 * 60)


if __name__ == "__main__":
    asyncio.run(main())
