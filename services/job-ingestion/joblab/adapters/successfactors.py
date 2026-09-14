import time
from urllib.parse import quote, urljoin

from bs4 import BeautifulSoup

from .base import Adapter
from .helpers import location_parts, text
from ..schemas import RawJob, SourceDiagnostic


def parse_legacy_listing(html: str, config: dict) -> list[RawJob]:
    soup = BeautifulSoup(html, "lxml")
    rows = []
    selector = config.get("job_link_selector", "a[href*='career_job_req_id']")
    for link in soup.select(selector):
        href = urljoin(config["url"], link.get("href", ""))
        container = link.find_parent(config.get("job_container", "tr")) or link.parent
        location_node = container.select_one(config.get("location_selector", ".location")) if container else None
        location = location_node.get_text(" ", strip=True) if location_node else ""
        city, country = location_parts(location)
        job_id = href.split("career_job_req_id=", 1)[-1].split("&", 1)[0]
        rows.append(RawJob(source_name=f"successfactors:{config['identifier']}", source_type="ats", source_job_id=job_id, source_url=href, company_name=config["company"], company_domain=config.get("company_domain"), title=link.get_text(" ", strip=True) or "Untitled", location_text=location, city=city, country=country, apply_url=href, raw_data={"mode": "legacy"}))
    return rows


class SuccessFactorsAdapter(Adapter):
    parser_name = "SAP SuccessFactors"

    async def fetch(self, max_jobs=None):
        started = time.monotonic()
        mode = self.config.get("mode", "csb")
        base = (self.config.get("url") or self.config.get("board_url") or "").rstrip("/")
        if not base:
            raise ValueError("SuccessFactors source requires a public career-site URL")
        if mode == "legacy":
            response = await self.fetcher.get(base, respect_robots=False)
            rows = self.limited(parse_legacy_listing(response.text, self.config), max_jobs)
            self.last_diagnostic = SourceDiagnostic(source=self.config["company"], http_status=response.status_code, parser=f"{self.parser_name} legacy", discovered=len(rows), parsed=len(rows), duration_seconds=time.monotonic() - started)
            return rows
        if mode != "csb":
            raise ValueError(f"Unsupported SuccessFactors mode: {mode}")
        locale = self.config.get("locale", "en_US")
        page, total, summaries, status = 0, None, [], None
        while total is None or len(summaries) < total:
            response = await self.fetcher.post(f"{base}/services/recruiting/v1/jobs", json={"keywords": "", "locale": locale, "location": self.config.get("location", "Germany"), "pageNumber": page, "sortBy": "recent"}, respect_robots=False)
            status = response.status_code
            payload = response.json()
            total = int(payload.get("totalJobs", 0))
            batch = [item.get("response", {}) for item in payload.get("jobSearchResult", [])]
            if not batch:
                break
            summaries.extend(batch)
            if max_jobs and len(summaries) >= max_jobs:
                break
            page += 1
        selected = summaries[:max_jobs] if max_jobs else summaries
        rows = []
        for item in selected:
            title = item.get("unifiedStandardTitle") or item.get("urlTitle") or "Untitled"
            job_id = str(item.get("id", ""))
            if not job_id:
                continue
            job_url = f"{base}/job/{quote(title, safe='')}/{job_id}-{locale}"
            description = ""
            try:
                detail_response = await self.fetcher.get(job_url, respect_robots=False)
                soup = BeautifulSoup(detail_response.text, "lxml")
                description_node = soup.select_one(".jobDisplay")
                description = text(description_node) if description_node else ""
            except Exception:
                pass
            locations = item.get("jobLocationShort") or []
            location = " | ".join(text(value) for value in locations)
            city, country = location_parts(location)
            rows.append(RawJob(source_name=f"successfactors:{self.config['identifier']}", source_type="ats", source_job_id=job_id, source_url=job_url, company_name=self.config["company"], company_domain=self.config.get("company_domain"), title=title, description=description, location_text=location, city=city, country=country, employment_type=" / ".join(item.get("filter2") or []), apply_url=job_url, raw_data=item))
        self.last_diagnostic = SourceDiagnostic(source=self.config["company"], http_status=status, parser=f"{self.parser_name} Career Site Builder", discovered=len(summaries), parsed=len(rows), duration_seconds=time.monotonic() - started)
        return rows
