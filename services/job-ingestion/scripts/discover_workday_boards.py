"""Discover Workday tenant/site pairs and verify current German jobs via CXS."""
from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace
from urllib.parse import quote, unquote, urlsplit

import httpx

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from joblab.config import Settings
from joblab.fetching import PoliteFetcher
from joblab.location_filter import is_german_job
from joblab.registry import AdapterStatus, BoardRecord, EndpointStatus, GermanyStatus, QueryStatus
from joblab.verification import VerificationProgress

REGISTRY = ROOT / "data" / "german_company_ats_registry.json"
OUTPUT = ROOT / "data" / "discoveries" / "workday_additional.json"
LOCATION_TERMS = ("Germany", "Deutschland", "Berlin", "Munich", "München", "Hamburg", "Frankfurt", "Stuttgart", "Cologne", "Köln", "Düsseldorf")
LOCALE = re.compile(r"^[a-z]{2}(?:-[A-Z]{2})?$")


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


def board_from_url(url):
    parts = urlsplit(url)
    host = parts.netloc.casefold().split(":")[0]
    if not re.fullmatch(r"[a-z0-9-]+\.wd\d+\.myworkdayjobs\.com", host):
        return None
    segments = [unquote(item) for item in parts.path.strip("/").split("/") if item]
    if "job" not in [item.casefold() for item in segments]:
        return None
    job_index = [item.casefold() for item in segments].index("job")
    if job_index < 1:
        return None
    site = segments[job_index - 1]
    if LOCALE.fullmatch(site) and job_index >= 2:
        site = segments[job_index - 2]
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,120}", site):
        return None
    tenant = host.split(".", 1)[0]
    terms = {term for term in LOCATION_TERMS if term.casefold() in unquote(url).casefold()}
    return tenant, site, host, terms


async def candidates(index, client):
    pattern = "*.myworkdayjobs.com/*"
    encoded = quote(pattern, safe="/*")
    info = json.loads(await fetch_text(client, f"https://index.commoncrawl.org/{index}-index?url={encoded}&output=json&filter=status:200&showNumPages=true"))
    found = {}
    for page in range(info["pages"]):
        url = f"https://index.commoncrawl.org/{index}-index?url={encoded}&output=json&filter=status:200&page={page}"
        for line in (await fetch_text(client, url)).splitlines():
            try:
                result = board_from_url(json.loads(line)["url"])
                if result and result[3]:
                    tenant, site, host, terms = result
                    key = f"{tenant}|{site}"
                    entry = found.setdefault(key, {"tenant": tenant, "site": site, "host": host, "terms": set()})
                    entry["terms"].update(terms)
            except (KeyError, ValueError, json.JSONDecodeError):
                continue
        print(f"Common Crawl page {page + 1}/{info['pages']}: {len(found)} Germany-signalled boards", flush=True)
    return found


def checkpoint(records, index, checked):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {"schema_version": 2, "provider": "workday", "common_crawl_index": index, "generated_at": datetime.now(UTC).isoformat(), "checked_candidates": len(checked), "checked_identifiers": sorted(checked), "records": [row.model_dump(mode="json") for row in records]}
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--target-additional", type=int, default=100)
    parser.add_argument("--index", default="CC-MAIN-2026-34")
    parser.add_argument("--delay", type=float, default=1.0)
    args = parser.parse_args()
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    existing = {row["board_identifier"].casefold() for row in registry["records"] if row["ats_provider"] == "workday"}
    saved, checked = [], set()
    if OUTPUT.exists():
        old = json.loads(OUTPUT.read_text(encoding="utf-8"))
        saved = [BoardRecord.model_validate(row) for row in old.get("records", [])]
        checked = set(old.get("checked_identifiers", []))
    async with httpx.AsyncClient(headers={"User-Agent": Settings().user_agent}) as client:
        discovered = await candidates(args.index, client)
    todo = [(key, value) for key, value in discovered.items() if key.casefold() not in existing and key.casefold() not in checked]
    todo.sort(key=lambda item: (-len(item[1]["terms"]), item[0].casefold()))
    progress = VerificationProgress("workday", len(todo))
    fetcher = PoliteFetcher(Settings().user_agent, 0)
    try:
        for identifier, candidate in todo:
            if len(saved) >= args.target_additional:
                break
            checked.add(identifier.casefold())
            tenant, site, host = candidate["tenant"], candidate["site"], candidate["host"]
            endpoint = f"https://{host}/wday/cxs/{tenant}/{site}/jobs"
            verified_jobs, total, response_status = [], 0, None
            for term in sorted(candidate["terms"]):
                try:
                    response = await fetcher.post(endpoint, json={"appliedFacets": {}, "limit": 20, "offset": 0, "searchText": term}, respect_robots=False)
                    response_status = response.status_code
                    payload = response.json()
                    total = max(total, int(payload.get("total", 0)))
                    for job in payload.get("jobPostings", []):
                        location = job.get("locationsText", "")
                        city = location.split(",", 1)[0].strip() or None
                        if is_german_job(SimpleNamespace(location_text=location, city=city, country=None)):
                            verified_jobs.append(job)
                    if verified_jobs:
                        break
                except Exception:
                    continue
            if verified_jobs:
                locations = list(dict.fromkeys(job.get("locationsText") for job in verified_jobs if job.get("locationsText")))[:5]
                board_url = f"https://{host}/{site}"
                saved.append(BoardRecord(company_name=tenant.replace("-", " ").title(), ats_provider="workday", board_identifier=identifier, board_url=board_url, api_url=endpoint, region="global", endpoint_status=EndpointStatus.IDENTIFIED, query_status=QueryStatus.QUERYABLE, germany_status=GermanyStatus.VERIFIED, adapter_status=AdapterStatus.WORKING, german_jobs_at_check=len(verified_jobs), total_jobs_at_check=total, sample_locations=locations, germany_evidence="Live Workday CXS search returned at least one Germany-located job", last_checked_at=datetime.now(UTC), last_http_status=response_status, provenance=f"Common Crawl {args.index} Germany-signalled URL + live Workday CXS verification"))
                progress.record("verified")
            else:
                progress.record("skipped")
            if progress.checked % 25 == 0 or (progress.verified and progress.verified % 10 == 0):
                checkpoint(saved, args.index, checked)
                print(progress.line(), flush=True)
            await asyncio.sleep(args.delay)
        checkpoint(saved, args.index, checked)
        print(progress.line())
        print(f"Saved {len(saved)} additional verified Workday boards to {OUTPUT}")
        if len(saved) < args.target_additional:
            raise SystemExit(2)
    finally:
        await fetcher.close()


if __name__ == "__main__":
    asyncio.run(main())
