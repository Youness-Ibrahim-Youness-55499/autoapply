"""Discover and verify additional Ashby boards with German jobs."""
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

from joblab.config import Settings
from joblab.fetching import PoliteFetcher
from joblab.registry import AdapterStatus, BoardRecord, EndpointStatus, GermanyStatus, QueryStatus
from joblab.verification import VerificationProgress

REGISTRY = ROOT / "data" / "german_company_ats_registry.json"
OUTPUT = ROOT / "data" / "discoveries" / "ashby_additional.json"
GERMANY = re.compile(r"\b(germany|deutschland|berlin|münchen|munich|hamburg|frankfurt|stuttgart|köln|koln|cologne|düsseldorf|dusseldorf|leipzig|dresden|hannover|nuremberg|nürnberg|nurnberg|bremen|bonn|karlsruhe|mannheim|aachen|potsdam|ingolstadt|wolfsburg|regensburg|darmstadt|heidelberg|münster|munster|bielefeld|augsburg|ulm|jülich|julich|tübingen|tubingen)\b", re.I)


def germany_text(*values):
    def flatten(value):
        if isinstance(value, dict):
            for nested in value.values(): yield from flatten(nested)
        elif isinstance(value, list):
            for nested in value: yield from flatten(nested)
        elif value is not None: yield str(value)
    return bool(GERMANY.search(" ".join(part for value in values for part in flatten(value))))


def german_job(job):
    return germany_text(job.get("location"), job.get("address"), job.get("secondaryLocations"))


def display_name(board, payload):
    return payload.get("organizationName") or payload.get("name") or re.sub(r"[-_]+", " ", board).title()


async def fetch_text(client, url, attempts=3):
    error = None
    for attempt in range(attempts):
        try:
            response = await client.get(url, timeout=60)
            response.raise_for_status()
            return response.text
        except (httpx.HTTPError, httpx.TimeoutException) as caught:
            error = caught
            if attempt + 1 < attempts: await asyncio.sleep(1.5 * (attempt + 1))
    raise error


async def candidates(index, client):
    pattern = "jobs.ashbyhq.com/*"
    info_url = f"https://index.commoncrawl.org/{index}-index?url={quote(pattern, safe='/*')}&output=json&filter=status:200&showNumPages=true"
    info = json.loads(await fetch_text(client, info_url))
    boards = set()
    for page in range(info["pages"]):
        url = f"https://index.commoncrawl.org/{index}-index?url={quote(pattern, safe='/*')}&output=json&filter=status:200&page={page}"
        for line in (await fetch_text(client, url)).splitlines():
            try:
                board = urlsplit(json.loads(line)["url"]).path.strip("/").split("/")[0]
                if re.fullmatch(r"[A-Za-z0-9_-]{1,80}", board): boards.add(board)
            except (KeyError, ValueError, json.JSONDecodeError): pass
        print(f"Common Crawl page {page + 1}/{info['pages']}: {len(boards)} candidate identifiers", flush=True)
    # The original 100-board pass scanned alphabetically from the beginning.
    # Reverse order reaches the previously untested portion first.
    return sorted(boards, key=str.casefold, reverse=True)


def checkpoint(records, index, checked):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {"schema_version": 2, "provider": "ashby", "common_crawl_index": index, "generated_at": datetime.now(UTC).isoformat(), "checked_candidates": len(checked), "checked_identifiers": sorted(checked), "records": [row.model_dump(mode="json") for row in records]}
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--target-additional", type=int, default=100)
    parser.add_argument("--index", default="CC-MAIN-2026-30")
    parser.add_argument("--delay", type=float, default=1.0)
    args = parser.parse_args()
    existing_doc = json.loads(REGISTRY.read_text(encoding="utf-8"))
    existing = {row["board_identifier"].casefold() for row in existing_doc["records"] if row["ats_provider"] == "ashby"}
    saved = []
    checked_before = set()
    if OUTPUT.exists():
        old = json.loads(OUTPUT.read_text(encoding="utf-8"))
        saved = [BoardRecord.model_validate(row) for row in old.get("records", [])]
        checked_before = set(old.get("checked_identifiers", []))
    async with httpx.AsyncClient(headers={"User-Agent": Settings().user_agent}) as client:
        board_candidates = await candidates(args.index, client)
    todo = [board for board in board_candidates if board.casefold() not in existing and board.casefold() not in checked_before]
    progress = VerificationProgress("ashby", len(todo))
    last_verified_report = 0
    fetcher = PoliteFetcher(Settings().user_agent, args.delay)
    checked = set(checked_before)
    try:
        for board in todo:
            if len(saved) >= args.target_additional: break
            checked.add(board.casefold())
            try:
                api = f"https://api.ashbyhq.com/posting-api/job-board/{quote(board)}?includeCompensation=true"
                response = await fetcher.get(api, respect_robots=False)
                payload = response.json()
                jobs = [job for job in payload.get("jobs", []) if job.get("isListed", True)]
                german = [job for job in jobs if german_job(job)]
                if german:
                    locations = list(dict.fromkeys(job.get("location") for job in german if job.get("location")))[:5]
                    saved.append(BoardRecord(company_name=display_name(board, payload), ats_provider="ashby", board_identifier=board, board_url=f"https://jobs.ashbyhq.com/{board}", api_url=api, endpoint_status=EndpointStatus.IDENTIFIED, query_status=QueryStatus.QUERYABLE, germany_status=GermanyStatus.VERIFIED, adapter_status=AdapterStatus.WORKING, german_jobs_at_check=len(german), total_jobs_at_check=len(jobs), sample_locations=locations, germany_evidence="Live Ashby API returned at least one Germany-located job", last_checked_at=datetime.now(UTC), last_http_status=response.status_code, provenance=f"Common Crawl {args.index} candidate + live Ashby API verification"))
                    progress.record("verified")
                else: progress.record("skipped")
            except Exception: progress.record("failed")
            milestone = progress.verified >= last_verified_report + 10
            if progress.checked % 25 == 0 or milestone:
                checkpoint(saved, args.index, checked); print(progress.line(), flush=True)
                if milestone: last_verified_report = progress.verified
        checkpoint(saved, args.index, checked)
        print(progress.line()); print(f"Saved {len(saved)} additional verified Ashby boards to {OUTPUT}")
        if len(saved) < args.target_additional: raise SystemExit(2)
    finally: await fetcher.close()


if __name__ == "__main__": asyncio.run(main())
