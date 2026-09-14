import time

from .base import Adapter
from .helpers import date, location_parts
from ..schemas import RawJob, SourceDiagnostic


class AshbyAdapter(Adapter):
    parser_name = "Ashby public API"

    async def fetch(self, max_jobs=None):
        started = time.monotonic()
        board = self.config["identifier"]
        url = f"https://api.ashbyhq.com/posting-api/job-board/{board}?includeCompensation=true"
        response = await self.fetcher.get(url, respect_robots=False)
        payload = response.json()
        listed = [row for row in payload.get("jobs", []) if row.get("isListed", True)]
        rows = []
        for item in self.limited(listed, max_jobs):
            location = item.get("location", "")
            city, country = location_parts(location)
            compensation = item.get("compensation") or {}
            rows.append(RawJob(source_name=f"ashby:{board}", source_type="ats", source_job_id=item.get("id") or item.get("jobUrl"), source_url=item.get("jobUrl"), company_name=self.config["company"], company_domain=self.config.get("company_domain"), title=item.get("title", "Untitled"), description=item.get("descriptionPlain", ""), location_text=location, city=city, country=country, remote_type=item.get("workplaceType"), employment_type=item.get("employmentType"), posted_at=date(item.get("publishedAt")), apply_url=item.get("applyUrl"), raw_data=item))
        self.last_diagnostic = SourceDiagnostic(source=self.config["company"], http_status=response.status_code, parser=self.parser_name, discovered=len(listed), parsed=len(rows), duration_seconds=time.monotonic()-started)
        return rows
