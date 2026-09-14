import time

from .base import Adapter
from .helpers import location_parts
from ..schemas import RawJob, SourceDiagnostic


class LeverAdapter(Adapter):
    parser_name = "Lever public API"

    async def fetch(self, max_jobs=None):
        started = time.monotonic()
        site = self.config["identifier"]
        host = "api.eu.lever.co" if self.config.get("region") == "eu" else "api.lever.co"
        url = f"https://{host}/v0/postings/{site}?mode=json"
        response = await self.fetcher.get(url, respect_robots=False)
        payload = response.json()
        rows = []
        for item in self.limited(payload, max_jobs):
            categories = item.get("categories") or {}
            location = categories.get("location", "")
            city, inferred_country = location_parts(location)
            salary = item.get("salaryRange") or {}
            rows.append(RawJob(source_name=f"lever:{site}", source_type="ats", source_job_id=item["id"], source_url=item.get("hostedUrl"), company_name=self.config["company"], company_domain=self.config.get("company_domain"), title=item.get("text", "Untitled"), description=item.get("descriptionPlain", ""), location_text=location, city=city, country=item.get("country") or inferred_country, remote_type=item.get("workplaceType"), employment_type=categories.get("commitment"), salary_min=salary.get("min"), salary_max=salary.get("max"), salary_currency=salary.get("currency"), apply_url=item.get("applyUrl"), raw_data=item))
        self.last_diagnostic = SourceDiagnostic(source=self.config["company"], http_status=response.status_code, parser=self.parser_name, discovered=len(payload), parsed=len(rows), duration_seconds=time.monotonic()-started)
        return rows
