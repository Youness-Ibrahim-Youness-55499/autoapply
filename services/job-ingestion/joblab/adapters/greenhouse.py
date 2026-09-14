import time

from .base import Adapter
from .helpers import date, location_parts, text
from ..schemas import RawJob, SourceDiagnostic


class GreenhouseAdapter(Adapter):
    parser_name = "Greenhouse public API"

    async def fetch(self, max_jobs=None):
        started = time.monotonic()
        board = self.config["identifier"]
        url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs?content=true"
        response = await self.fetcher.get(url, respect_robots=False)
        payload = response.json()
        found = payload.get("jobs", [])
        rows = []
        for item in self.limited(found, max_jobs):
            location = (item.get("location") or {}).get("name", "")
            city, country = location_parts(location)
            rows.append(RawJob(source_name=f"greenhouse:{board}", source_type="ats", source_job_id=str(item["id"]), source_url=item.get("absolute_url"), company_name=self.config["company"], company_domain=self.config.get("company_domain"), title=item.get("title", "Untitled"), description=text(item.get("content")), location_text=location, city=city, country=country, posted_at=date(item.get("updated_at")), apply_url=item.get("absolute_url"), raw_data=item))
        self.last_diagnostic = SourceDiagnostic(source=self.config["company"], http_status=response.status_code, parser=self.parser_name, discovered=len(found), parsed=len(rows), duration_seconds=time.monotonic()-started)
        return rows
