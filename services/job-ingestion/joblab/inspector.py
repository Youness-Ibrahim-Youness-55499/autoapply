from __future__ import annotations

import json
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from .adapters.generic import LINK_HINTS, jsonld_from_html
from .fetching import PoliteFetcher

FINGERPRINTS = {"greenhouse": ("greenhouse.io", "boards.greenhouse.io"), "lever": ("jobs.lever.co", "jobs.eu.lever.co"), "ashby": ("ashbyhq.com",), "workday": ("myworkdayjobs.com",), "smartrecruiters": ("smartrecruiters.com",), "personio": ("personio.de", "personio.com"), "recruitee": ("recruitee.com",), "teamtailor": ("teamtailor.com",), "successfactors": ("successfactors",)}


async def inspect_url(url: str, fetcher: PoliteFetcher):
    response = await fetcher.get(url)
    soup = BeautifulSoup(response.text, "lxml")
    haystack = f"{response.url}\n{response.text[:500000]}".lower()
    detected = next((provider for provider, clues in FINGERPRINTS.items() if any(clue in haystack for clue in clues)), "generic")
    links = []
    for anchor in soup.select("a[href]"):
        target = urljoin(str(response.url), anchor.get("href"))
        if any(hint in target.lower() for hint in LINK_HINTS) and target not in links: links.append(target)
    jsonld = jsonld_from_html(response.text)
    may_need_js = not jsonld and len(links) == 0 and len(soup.get_text(" ", strip=True)) < 500
    return {"url": str(response.url), "http_status": response.status_code, "page_title": soup.title.get_text(" ", strip=True) if soup.title else None, "detected_provider": detected, "jsonld_present": bool(soup.select('script[type="application/ld+json"]')), "jobposting_count": len(jsonld), "job_links": links[:50], "possible_job_links": len(links), "javascript_may_be_needed": may_need_js}
