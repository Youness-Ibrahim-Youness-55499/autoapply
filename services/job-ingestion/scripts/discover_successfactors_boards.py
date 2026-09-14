"""Discover SAP Career Site Builder domains with current German jobs."""
from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace
from urllib.parse import quote, urlsplit

import httpx

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from joblab.config import Settings
from joblab.fetching import PoliteFetcher
from joblab.location_filter import is_german_job
from joblab.registry import AdapterStatus, BoardRecord, EndpointStatus, GermanyStatus, QueryStatus
from joblab.verification import VerificationProgress

REGISTRY = ROOT / "data" / "german_company_ats_registry.json"
OUTPUT = ROOT / "data" / "discoveries" / "successfactors_additional.json"


async def fetch_text(client, url, attempts=4):
    error = None
    for attempt in range(attempts):
        try:
            response = await client.get(url, timeout=120)
            response.raise_for_status()
            return response.text
        except httpx.HTTPError as caught:
            error = caught
            if attempt + 1 < attempts:
                await asyncio.sleep(2 * (attempt + 1))
    raise error


async def candidates(index, client):
    pattern = "*.jobs.hr.cloud.sap/job/*"
    encoded = quote(pattern, safe="/*")
    info = json.loads(await fetch_text(client, f"https://index.commoncrawl.org/{index}-index?url={encoded}&output=json&filter=status:200&showNumPages=true"))
    hosts = set()
    for page in range(info["pages"]):
        url = f"https://index.commoncrawl.org/{index}-index?url={encoded}&output=json&filter=status:200&page={page}"
        for line in (await fetch_text(client, url)).splitlines():
            try:
                host = urlsplit(json.loads(line)["url"]).netloc.casefold().split(":")[0]
                if re.fullmatch(r"[a-z0-9-]+\.jobs\.hr\.cloud\.sap", host):
                    hosts.add(host)
            except (KeyError, ValueError, json.JSONDecodeError):
                continue
        print(f"Common Crawl page {page + 1}/{info['pages']}: {len(hosts)} Career Site Builder domains", flush=True)
    return sorted(hosts)


def checkpoint(records, index, checked):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {"schema_version": 2, "provider": "successfactors", "common_crawl_index": index, "generated_at": datetime.now(UTC).isoformat(), "checked_candidates": len(checked), "checked_identifiers": sorted(checked), "records": [row.model_dump(mode="json") for row in records]}
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--target-additional", type=int, default=100)
    parser.add_argument("--index", default="CC-MAIN-2026-34")
    parser.add_argument("--delay", type=float, default=1.0)
    args = parser.parse_args()
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    existing = {row["board_identifier"].casefold() for row in registry["records"] if row["ats_provider"] == "successfactors"}
    saved, checked = [], set()
    if OUTPUT.exists():
        old = json.loads(OUTPUT.read_text(encoding="utf-8"))
        saved = [BoardRecord.model_validate(row) for row in old.get("records", [])]
        checked = set(old.get("checked_identifiers", []))
    async with httpx.AsyncClient(headers={"User-Agent": Settings().user_agent}) as client:
        discovered = await candidates(args.index, client)
    todo = [host for host in discovered if host not in existing and host not in checked]
    progress = VerificationProgress("successfactors", len(todo))
    fetcher = PoliteFetcher(Settings().user_agent, 0)
    try:
        for host in todo:
            if len(saved) >= args.target_additional:
                break
            checked.add(host)
            endpoint = f"https://{host}/services/recruiting/v1/jobs"
            try:
                response = await fetcher.post(endpoint, json={"keywords": "", "locale": "en_US", "location": "Germany", "pageNumber": 0, "sortBy": "recent"}, respect_robots=False)
                payload = response.json()
                summaries = [item.get("response", {}) for item in payload.get("jobSearchResult", [])]
                german = []
                for item in summaries:
                    location = " | ".join(str(value) for value in item.get("jobLocationShort", []))
                    countries = {str(value).casefold() for value in item.get("jobLocationCountry", [])}
                    city = location.split(",", 1)[0].strip() or None
                    if countries.intersection({"germany", "de", "deu", "deutschland"}) or is_german_job(SimpleNamespace(location_text=location, city=city, country=None)):
                        german.append(item)
                if german:
                    locations = list(dict.fromkeys(" | ".join(str(value) for value in item.get("jobLocationShort", [])) for item in german))[:5]
                    slug = host.removesuffix(".jobs.hr.cloud.sap")
                    saved.append(BoardRecord(company_name=slug.replace("-", " ").title(), ats_provider="successfactors", board_identifier=host, board_url=f"https://{host}", api_url=endpoint, region="global", endpoint_status=EndpointStatus.IDENTIFIED, query_status=QueryStatus.QUERYABLE, germany_status=GermanyStatus.VERIFIED, adapter_status=AdapterStatus.WORKING, german_jobs_at_check=int(payload.get("totalJobs", len(german))), total_jobs_at_check=int(payload.get("totalJobs", len(summaries))), sample_locations=locations, germany_evidence="Live Career Site Builder service returned Germany-filtered jobs with German location data", last_checked_at=datetime.now(UTC), last_http_status=response.status_code, provenance=f"Common Crawl {args.index} domain + live SAP recruiting-service verification"))
                    progress.record("verified")
                else:
                    progress.record("skipped")
            except Exception:
                progress.record("skipped")
            if progress.checked % 25 == 0 or (progress.verified and progress.verified % 10 == 0):
                checkpoint(saved, args.index, checked)
                print(progress.line(), flush=True)
            await asyncio.sleep(args.delay)
        checkpoint(saved, args.index, checked)
        print(progress.line())
        print(f"Saved {len(saved)} additional verified SuccessFactors boards to {OUTPUT}")
        if len(saved) < args.target_additional:
            raise SystemExit(2)
    finally:
        await fetcher.close()


if __name__ == "__main__":
    asyncio.run(main())
