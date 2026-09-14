"""Discover Lever boards and retain only boards with Germany-located jobs."""
from __future__ import annotations

import argparse
import asyncio
import csv
import json
import re
import sys
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import quote, urlsplit

import httpx

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from joblab.config import Settings
from joblab.fetching import PoliteFetcher
from joblab.registry import AdapterStatus, BoardRecord, EndpointStatus, GermanyStatus, QueryStatus
from joblab.verification import VerificationProgress

REGISTRY = ROOT / "data" / "german_company_ats_registry.json"
OUTPUT = ROOT / "data" / "discoveries" / "lever_additional.json"
GERMANY = re.compile(r"\b(germany|deutschland|berlin|münchen|munich|hamburg|frankfurt|stuttgart|köln|koln|cologne|düsseldorf|dusseldorf|leipzig|dresden|hannover|nuremberg|nürnberg|bremen|bonn|karlsruhe|mannheim|aachen|potsdam|ingolstadt|wolfsburg|regensburg|darmstadt|heidelberg|münster|bielefeld|augsburg|ulm)\b", re.I)


def german_job(job):
    categories = job.get("categories") or {}
    values = [job.get("country"), categories.get("location"), job.get("workplaceType")]
    return str(job.get("country", "")).casefold() in {"de", "deu", "germany"} or bool(GERMANY.search(" ".join(str(value or "") for value in values)))


async def fetch_text(client, url):
    response = await client.get(url, timeout=60)
    response.raise_for_status()
    return response.text


async def candidates(index, client):
    found: dict[str, set[str]] = {}
    for region, host in (("global", "jobs.lever.co"), ("eu", "jobs.eu.lever.co")):
        pattern = f"{host}/*"
        encoded = quote(pattern, safe="/*")
        info = json.loads(await fetch_text(client, f"https://index.commoncrawl.org/{index}-index?url={encoded}&output=json&filter=status:200&showNumPages=true"))
        for page in range(info["pages"]):
            url = f"https://index.commoncrawl.org/{index}-index?url={encoded}&output=json&filter=status:200&page={page}"
            for line in (await fetch_text(client, url)).splitlines():
                try:
                    identifier = urlsplit(json.loads(line)["url"]).path.strip("/").split("/")[0]
                    if re.fullmatch(r"[A-Za-z0-9_-]{1,100}", identifier): found.setdefault(identifier.casefold(), set()).add(region)
                except (KeyError, ValueError, json.JSONDecodeError):
                    continue
            print(f"Common Crawl {host} page {page + 1}/{info['pages']}: {len(found)} candidates", flush=True)
    return found


def checkpoint(records, index, checked):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {"schema_version": 2, "provider": "lever", "common_crawl_index": index, "generated_at": datetime.now(UTC).isoformat(), "checked_candidates": len(checked), "checked_identifiers": sorted(checked), "records": [row.model_dump(mode="json") for row in records]}
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--target-additional", type=int, default=100)
    parser.add_argument("--index", default="CC-MAIN-2026-30")
    parser.add_argument("--delay", type=float, default=1.0)
    parser.add_argument("--seed-file", type=Path)
    args = parser.parse_args()
    existing_doc = json.loads(REGISTRY.read_text(encoding="utf-8"))
    existing = {row["board_identifier"].casefold() for row in existing_doc["records"] if row["ats_provider"] == "lever"}
    saved, checked = [], set()
    if OUTPUT.exists():
        old = json.loads(OUTPUT.read_text(encoding="utf-8"))
        saved = [BoardRecord.model_validate(row) for row in old.get("records", [])]
        checked = set(old.get("checked_identifiers", []))
    seed_metadata = {}
    if args.seed_file:
        with args.seed_file.open(encoding="utf-8-sig", newline="") as handle:
            seed_rows = list(csv.DictReader(handle))
        discovered = {}
        for row in seed_rows:
            identifier = row["lever_slug"].strip().casefold()
            discovered.setdefault(identifier, set()).add(row.get("region") or ("eu" if "jobs.eu.lever.co" in row.get("board_url", "") else "global"))
            seed_metadata[identifier] = row
    else:
        async with httpx.AsyncClient(headers={"User-Agent": Settings().user_agent}) as client:
            discovered = await candidates(args.index, client)
    todo = [(identifier, regions) for identifier, regions in discovered.items() if identifier not in existing and (args.seed_file or identifier not in checked)]
    # Prefer EU candidates, then scan identifiers in reverse order so repeated
    # runs do not remain stuck in the same stale alphabetical tail.
    todo.sort(key=lambda item: item[0], reverse=True)
    todo.sort(key=lambda item: "eu" not in item[1])
    progress = VerificationProgress("lever", len(todo))
    fetcher = PoliteFetcher(Settings().user_agent, args.delay)
    try:
        for identifier, regions in todo:
            if len(saved) >= args.target_additional:
                break
            checked.add(identifier)
            preferred = sorted(regions, key=lambda value: value != "eu")
            attempts = preferred + [region for region in ("eu", "global") if region not in preferred]
            verified = False
            for region in attempts:
                host = "api.eu.lever.co" if region == "eu" else "api.lever.co"
                api = f"https://{host}/v0/postings/{quote(identifier)}?mode=json"
                try:
                    response = await fetcher.get(api, respect_robots=False)
                    jobs = response.json()
                    german = [job for job in jobs if german_job(job)]
                    if german:
                        locations = list(dict.fromkeys((job.get("categories") or {}).get("location") for job in german if (job.get("categories") or {}).get("location")))[:5]
                        metadata = seed_metadata.get(identifier, {})
                        saved.append(BoardRecord(company_name=metadata.get("company_name") or identifier.replace("-", " ").title(), ats_provider="lever", board_identifier=identifier, board_url=f"https://{'jobs.eu.lever.co' if region == 'eu' else 'jobs.lever.co'}/{identifier}", api_url=api, region=region, endpoint_status=EndpointStatus.IDENTIFIED, query_status=QueryStatus.QUERYABLE, germany_status=GermanyStatus.VERIFIED, adapter_status=AdapterStatus.WORKING, german_jobs_at_check=len(german), total_jobs_at_check=len(jobs), sample_locations=locations, germany_evidence=f"Live Lever {region.upper()} API returned at least one Germany-located job", last_checked_at=datetime.now(UTC), last_http_status=response.status_code, provenance=("User-supplied candidate + live Lever API verification" if args.seed_file else f"Common Crawl {args.index} candidate + live Lever API verification")))
                        progress.record("verified")
                        verified = True
                        break
                except Exception:
                    continue
            if not verified:
                progress.record("skipped")
            if progress.checked % 25 == 0 or progress.verified % 10 == 0 and verified:
                checkpoint(saved, args.index, checked)
                print(progress.line(), flush=True)
        checkpoint(saved, args.index, checked)
        print(progress.line())
        print(f"Saved {len(saved)} additional verified Lever boards to {OUTPUT}")
        if len(saved) < args.target_additional:
            raise SystemExit(2)
    finally:
        await fetcher.close()


if __name__ == "__main__":
    asyncio.run(main())
