import time

from .base import Adapter
from .helpers import date, text
from ..schemas import RawJob, SourceDiagnostic


class SmartRecruitersAdapter(Adapter):
    parser_name = "SmartRecruiters public Posting API"

    async def fetch(self, max_jobs=None):
        started = time.monotonic()
        company = self.config["identifier"]
        url = f"https://api.smartrecruiters.com/v1/companies/{company}/postings?limit=100&country=de"
        response = await self.fetcher.get(url, respect_robots=False)
        payload = response.json()
        found = payload.get("content", [])
        rows = []
        for item in self.limited(found, max_jobs):
            location = item.get("location") or {}
            location_text = ", ".join(filter(None, [location.get("city"), location.get("region"), location.get("country")]))
            job_id = str(item.get("id") or item.get("uuid"))
            detail_url = f"https://api.smartrecruiters.com/v1/companies/{company}/postings/{job_id}"
            detail_response = await self.fetcher.get(detail_url, respect_robots=False)
            detail = detail_response.json()
            sections = ((detail.get("jobAd") or {}).get("sections") or {})
            description = " ".join(text(section.get("text")) for section in sections.values() if isinstance(section, dict))
            rows.append(RawJob(source_name=f"smartrecruiters:{company}", source_type="ats", source_job_id=job_id, source_url=detail.get("applyUrl") or detail_url, company_name=self.config["company"], company_domain=self.config.get("company_domain"), title=item.get("name", "Untitled"), description=description, location_text=location_text, city=location.get("city"), state=location.get("region"), country=location.get("country"), remote_type="remote" if location.get("remote") else None, employment_type=(item.get("typeOfEmployment") or {}).get("label"), posted_at=date(item.get("releasedDate")), apply_url=detail.get("applyUrl"), raw_data=detail))
        self.last_diagnostic = SourceDiagnostic(source=self.config["company"], http_status=response.status_code, parser=self.parser_name, discovered=payload.get("totalFound", len(found)), parsed=len(rows), duration_seconds=time.monotonic() - started)
        return rows
