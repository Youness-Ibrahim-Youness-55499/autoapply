from __future__ import annotations

import hashlib
import json
import time
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup

from .base import Adapter
from .helpers import date, domain, location_parts, text
from ..schemas import RawJob, SourceDiagnostic

LINK_HINTS = ("/jobs/", "/job/", "/careers/", "/career/", "/stellen/", "/stellenangebote/", "/position/", "/vacancy/", "/vacancies/")


def jobposting_objects(payload):
    if isinstance(payload, list):
        for item in payload:
            yield from jobposting_objects(item)
    elif isinstance(payload, dict):
        if payload.get("@type") == "JobPosting" or "JobPosting" in (payload.get("@type") or []):
            yield payload
        for key in ("@graph", "mainEntity", "itemListElement"):
            if key in payload:
                yield from jobposting_objects(payload[key])


def jsonld_from_html(html: str):
    soup = BeautifulSoup(html, "lxml")
    found = []
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            found.extend(jobposting_objects(json.loads(script.string or script.get_text())))
        except (json.JSONDecodeError, TypeError):
            continue
    return found


def raw_from_jsonld(item: dict, config: dict, page_url: str):
    organization = item.get("hiringOrganization") or {}
    location = item.get("jobLocation") or {}
    if isinstance(location, list):
        location = location[0] if location else {}
    address = location.get("address") or {}
    if isinstance(address, str):
        location_text, address = address, {}
    else:
        location_text = ", ".join(filter(None, [address.get("addressLocality"), address.get("addressRegion"), address.get("addressCountry")]))
    salary = item.get("baseSalary") or {}
    salary_value = salary.get("value") if isinstance(salary, dict) else {}
    if not isinstance(salary_value, dict): salary_value = {}
    source_url = item.get("url") or page_url
    identity = item.get("identifier")
    if isinstance(identity, dict): identity = identity.get("value")
    return RawJob(source_name=f"generic:{config['company']}", source_type="generic", source_job_id=str(identity or hashlib.sha256(source_url.encode()).hexdigest()[:24]), source_url=source_url, company_name=organization.get("name") or config["company"], company_domain=config.get("company_domain") or domain(config.get("url")), title=text(item.get("title") or "Untitled"), description=text(item.get("description")), location_text=location_text, city=address.get("addressLocality"), state=address.get("addressRegion"), country=address.get("addressCountry"), remote_type="remote" if item.get("jobLocationType") == "TELECOMMUTE" else None, employment_type=text(item.get("employmentType")), salary_min=salary_value.get("minValue") or salary_value.get("value"), salary_max=salary_value.get("maxValue") or salary_value.get("value"), salary_currency=salary.get("currency"), posted_at=date(item.get("datePosted")), expires_at=date(item.get("validThrough")), apply_url=source_url, raw_data=item)


class GenericAdapter(Adapter):
    parser_name = "generic automatic"

    async def fetch(self, max_jobs=None):
        started = time.monotonic()
        response = await self.fetcher.get(self.config["url"])
        page_url = str(response.url)
        direct = jsonld_from_html(response.text)
        jobs = [raw_from_jsonld(item, self.config, page_url) for item in direct]
        parser = "JSON-LD"
        discovered = len(direct)
        failed = 0

        if not jobs and self.config.get("selectors"):
            parser = "configured HTML selectors"
            soup = BeautifulSoup(response.text, "lxml")
            selectors = self.config["selectors"]
            cards = soup.select(selectors["job_card"])
            discovered = len(cards)
            for card in self.limited(cards, max_jobs):
                try:
                    link = card.select_one(selectors.get("link", "a"))
                    url = urljoin(page_url, link.get("href")) if link else page_url
                    title_node = card.select_one(selectors["title"])
                    location_node = card.select_one(selectors.get("location", "__none__"))
                    description_node = card.select_one(selectors.get("description", "__none__"))
                    location_text = text(location_node)
                    city, country = location_parts(location_text)
                    jobs.append(RawJob(source_name=f"generic:{self.config['company']}", source_type="generic", source_job_id=hashlib.sha256(url.encode()).hexdigest()[:24], source_url=url, company_name=self.config["company"], company_domain=self.config.get("company_domain") or domain(page_url), title=text(title_node), description=text(description_node), location_text=location_text, city=city, country=country, apply_url=url, raw_data={"parser": parser, "page_url": page_url}))
                except Exception:
                    failed += 1

        if not jobs:
            parser = "job-link discovery + JSON-LD"
            soup = BeautifulSoup(response.text, "lxml")
            base_domain = urlparse(page_url).netloc
            links = []
            for anchor in soup.select("a[href]"):
                url = urljoin(page_url, anchor.get("href"))
                if urlparse(url).netloc == base_domain and (any(hint in url.lower() for hint in LINK_HINTS) or "job" in anchor.get_text(" ", strip=True).lower()):
                    if url != page_url and url not in links: links.append(url)
            links = self.limited(links, max_jobs or 10)
            discovered = len(links)
            for url in links:
                try:
                    detail = await self.fetcher.get(url)
                    for item in jsonld_from_html(detail.text):
                        jobs.append(raw_from_jsonld(item, self.config, str(detail.url)))
                        if max_jobs and len(jobs) >= max_jobs: break
                except Exception:
                    failed += 1
                if max_jobs and len(jobs) >= max_jobs: break

        jobs = self.limited(jobs, max_jobs)
        self.parser_name = parser
        self.last_diagnostic = SourceDiagnostic(source=self.config["company"], http_status=response.status_code, parser=parser, discovered=discovered, parsed=len(jobs), failed=failed, duration_seconds=time.monotonic()-started)
        return jobs
