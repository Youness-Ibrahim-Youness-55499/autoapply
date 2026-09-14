"""Discover public Personio XML feeds and verify Germany-located jobs."""
from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import quote, urlsplit

import httpx

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from joblab.adapters.personio import parse_positions
from joblab.config import Settings
from joblab.fetching import PoliteFetcher
from joblab.location_filter import is_german_job
from joblab.registry import AdapterStatus, BoardRecord, EndpointStatus, GermanyStatus, QueryStatus
from joblab.verification import VerificationProgress

REGISTRY = ROOT / "data" / "german_company_ats_registry.json"
OUTPUT = ROOT / "data" / "discoveries" / "personio_additional.json"


async def fetch_text(client, url):
    response = await client.get(url, timeout=60)
    response.raise_for_status()
    return response.text


async def candidates(index, client):
    found: dict[str, set[str]] = {}
    for suffix in ("jobs.personio.com", "jobs.personio.de"):
        pattern = f"*.{suffix}/xml*"
        encoded = quote(pattern, safe="/*")
        info = json.loads(await fetch_text(client, f"https://index.commoncrawl.org/{index}-index?url={encoded}&output=json&filter=status:200&showNumPages=true"))
        for page in range(info["pages"]):
            url = f"https://index.commoncrawl.org/{index}-index?url={encoded}&output=json&filter=status:200&page={page}"
            for line in (await fetch_text(client, url)).splitlines():
                try:
                    host = urlsplit(json.loads(line)["url"]).netloc.casefold().split(":")[0]
                    ending = f".{suffix}"
                    if host.endswith(ending):
                        slug = host.removesuffix(ending)
                        if re.fullmatch(r"[a-z0-9][a-z0-9-]{1,100}", slug):
                            found.setdefault(slug, set()).add("com" if suffix.endswith(".com") else "de")
                except (KeyError, ValueError, json.JSONDecodeError):
                    continue
            print(f"Common Crawl {suffix} page {page + 1}/{info['pages']}: {len(found)} candidates", flush=True)
    return found


def checkpoint(records, index, checked):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {"schema_version": 2, "provider": "personio", "common_crawl_index": index, "generated_at": datetime.now(UTC).isoformat(), "checked_candidates": len(checked), "checked_identifiers": sorted(checked), "records": [row.model_dump(mode="json") for row in records]}
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--target-additional", type=int, default=100)
    parser.add_argument("--index", default="CC-MAIN-2026-34")
    parser.add_argument("--delay", type=float, default=1.0)
    args = parser.parse_args()
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    existing = {row["board_identifier"].casefold() for row in registry["records"] if row["ats_provider"] == "personio"}
    saved, checked = [], set()
    if OUTPUT.exists():
        old = json.loads(OUTPUT.read_text(encoding="utf-8"))
        saved = [BoardRecord.model_validate(row) for row in old.get("records", [])]
        checked = set(old.get("checked_identifiers", []))
    async with httpx.AsyncClient(headers={"User-Agent": Settings().user_agent}) as client:
        discovered = await candidates(args.index, client)
    todo = [(slug, hosts) for slug, hosts in discovered.items() if slug not in existing and slug not in checked]
    todo.sort(key=lambda item: item[0], reverse=True)
    progress = VerificationProgress("personio", len(todo))
    fetcher = PoliteFetcher(Settings().user_agent, 0)
    try:
        for slug, known_hosts in todo:
            if len(saved) >= args.target_additional:
                break
            checked.add(slug)
            verified = False
            for extension in sorted(known_hosts, key=lambda value: value != "com") + [value for value in ("com", "de") if value not in known_hosts]:
                host = f"{slug}.jobs.personio.{extension}"
                api = f"https://{host}/xml?language=en"
                try:
                    response = await fetcher.get(api, respect_robots=False)
                    rows = parse_positions(response.text, {"company": slug.replace("-", " ").title(), "identifier": slug}, host)
                    german = [row for row in rows if is_german_job(row)]
                    if german:
                        company = next((row.raw_data.get("subcompany") for row in german if row.raw_data.get("subcompany")), None) or slug.replace("-", " ").title()
                        locations = list(dict.fromkeys(row.location_text for row in german if row.location_text))[:5]
                        saved.append(BoardRecord(company_name=company, ats_provider="personio", board_identifier=slug, board_url=f"https://{host}", api_url=api, region="eu", endpoint_status=EndpointStatus.IDENTIFIED, query_status=QueryStatus.QUERYABLE, germany_status=GermanyStatus.VERIFIED, adapter_status=AdapterStatus.WORKING, german_jobs_at_check=len(german), total_jobs_at_check=len(rows), sample_locations=locations, germany_evidence="Live Personio XML feed returned at least one Germany-located job", last_checked_at=datetime.now(UTC), last_http_status=response.status_code, provenance=f"Common Crawl {args.index} candidate + live Personio XML verification"))
                        progress.record("verified")
                        verified = True
                        break
                except Exception:
                    continue
            if not verified:
                progress.record("skipped")
            if progress.checked % 25 == 0 or (verified and progress.verified % 10 == 0):
                checkpoint(saved, args.index, checked)
                print(progress.line(), flush=True)
            await asyncio.sleep(args.delay)
        checkpoint(saved, args.index, checked)
        print(progress.line())
        print(f"Saved {len(saved)} additional verified Personio boards to {OUTPUT}")
        if len(saved) < args.target_additional:
            raise SystemExit(2)
    finally:
        await fetcher.close()


if __name__ == "__main__":
    asyncio.run(main())
