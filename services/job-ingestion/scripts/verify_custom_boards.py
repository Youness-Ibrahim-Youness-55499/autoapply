"""Live-verify custom boards and export registry-compatible records."""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from datetime import UTC, datetime
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from joblab.adapters import adapter_for
from joblab.board_catalog import BoardInput, api_url, board_url, source_config
from joblab.config import Settings
from joblab.fetching import PoliteFetcher
from joblab.location_filter import is_german_job
from joblab.registry import AdapterStatus, BoardRecord, EndpointStatus, GermanyStatus, QueryStatus

CATALOG = ROOT / "config" / "custom_boards.yaml"
OUTPUT = ROOT / "data" / "discoveries" / "custom_boards.json"


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-jobs", type=int, default=20)
    args = parser.parse_args()
    if not 1 <= args.max_jobs <= 100:
        parser.error("--max-jobs must be between 1 and 100")
    document = yaml.safe_load(CATALOG.read_text(encoding="utf-8")) or {}
    candidates = [BoardInput.model_validate(row) for row in document.get("boards", [])]
    settings = Settings()
    fetcher = PoliteFetcher(settings.user_agent, settings.per_domain_delay)
    records = []
    try:
        for candidate in candidates:
            config = source_config(candidate)
            try:
                adapter = adapter_for(config, fetcher)
                jobs = await adapter.fetch(max_jobs=args.max_jobs)
                german = [job for job in jobs if is_german_job(job)]
                verified = bool(german)
                diagnostic = adapter.last_diagnostic
                records.append(BoardRecord(company_name=candidate.company, company_domain=candidate.company_domain, ats_provider=candidate.provider, board_identifier=candidate.identifier, board_url=board_url(candidate), api_url=api_url(candidate), region=candidate.region, endpoint_status=EndpointStatus.IDENTIFIED, query_status=QueryStatus.QUERYABLE, germany_status=GermanyStatus.VERIFIED if verified else GermanyStatus.NO_GERMAN_JOBS, adapter_status=AdapterStatus.WORKING, german_jobs_at_check=len(german), total_jobs_at_check=diagnostic.discovered, sample_locations=list(dict.fromkeys(job.location_text for job in german if job.location_text))[:5], germany_evidence="Live adapter verification found Germany-located jobs" if verified else "Live adapter verification found no Germany-located jobs", last_checked_at=datetime.now(UTC), last_http_status=diagnostic.http_status, provenance="User-maintained custom board catalog", options=candidate.options))
                print(f"{candidate.provider}:{candidate.identifier} - {len(german)} German jobs")
            except Exception as error:
                records.append(BoardRecord(company_name=candidate.company, company_domain=candidate.company_domain, ats_provider=candidate.provider, board_identifier=candidate.identifier, board_url=board_url(candidate), api_url=api_url(candidate), region=candidate.region, endpoint_status=EndpointStatus.IDENTIFIED, query_status=QueryStatus.BLOCKED, germany_status=GermanyStatus.UNVERIFIED, adapter_status=AdapterStatus.WORKING, verification_error=str(error), provenance="User-maintained custom board catalog", options=candidate.options))
                print(f"{candidate.provider}:{candidate.identifier} - failed: {error}")
    finally:
        await fetcher.close()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({"schema_version": 2, "provider": "custom", "generated_at": datetime.now(UTC).isoformat(), "records": [record.model_dump(mode="json") for record in records]}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {len(records)} records to {OUTPUT}")


if __name__ == "__main__":
    asyncio.run(main())
