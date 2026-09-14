import time
from types import SimpleNamespace
from urllib.parse import urlsplit

from .base import Adapter
from .helpers import date, location_parts, text
from ..schemas import RawJob, SourceDiagnostic
from ..location_filter import is_german_job


def workday_config(config):
    identifier = config.get("identifier", "")
    if "|" not in identifier:
        raise ValueError("Workday identifier must be tenant|career_site")
    tenant, site = identifier.split("|", 1)
    board_url = config.get("url") or config.get("board_url")
    if not board_url:
        raise ValueError("Workday source requires its public board URL")
    parts = urlsplit(board_url)
    origin = f"{parts.scheme}://{parts.netloc}"
    return board_url.rstrip("/"), f"{origin}/wday/cxs/{tenant}/{site}"


class WorkdayAdapter(Adapter):
    parser_name = "Workday CXS"

    async def fetch(self, max_jobs=None):
        started = time.monotonic()
        board_url, cxs = workday_config(self.config)
        page_size = min(int(self.config.get("page_size", 20)), 20)
        offset, postings, list_status = 0, [], None
        while True:
            response = await self.fetcher.post(f"{cxs}/jobs", json={"appliedFacets": {}, "limit": page_size, "offset": offset, "searchText": ""}, respect_robots=False)
            list_status = response.status_code
            payload = response.json()
            page = payload.get("jobPostings", [])
            postings.extend(page)
            total = int(payload.get("total", len(postings)))
            if not page or len(postings) >= total:
                break
            offset += len(page)
        german_postings = []
        for posting in postings:
            location = posting.get("locationsText", "")
            city, country = location_parts(location)
            if is_german_job(SimpleNamespace(location_text=location, city=city, country=country)):
                german_postings.append(posting)
        selected = german_postings[:max_jobs] if max_jobs else german_postings
        rows = []
        for posting in selected:
            external_path = posting.get("externalPath", "")
            if not external_path:
                continue
            detail_response = await self.fetcher.get(f"{cxs}{external_path}", respect_robots=False)
            detail = detail_response.json().get("jobPostingInfo", {})
            location = detail.get("location") or posting.get("locationsText", "")
            additional = detail.get("additionalLocations") or []
            if isinstance(additional, list) and additional:
                location = " | ".join([location, *[str(item) for item in additional]]).strip(" |")
            city, country = location_parts(location)
            source_url = f"{board_url}{external_path}"
            rows.append(RawJob(source_name=f"workday:{self.config['identifier']}", source_type="ats", source_job_id=str(detail.get("jobReqId") or detail.get("jobPostingId") or external_path), source_url=source_url, company_name=self.config["company"], company_domain=self.config.get("company_domain"), title=detail.get("title") or posting.get("title") or "Untitled", description=text(detail.get("jobDescription")), location_text=location, city=city, country=country, remote_type=detail.get("remoteType"), employment_type=detail.get("timeType"), posted_at=date(detail.get("startDate")), apply_url=source_url, raw_data={"posting": posting, "detail": detail}))
        self.last_diagnostic = SourceDiagnostic(source=self.config["company"], http_status=list_status, parser=self.parser_name, discovered=len(postings), parsed=len(rows), duration_seconds=time.monotonic() - started)
        return rows
