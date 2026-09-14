import time
from xml.etree import ElementTree

from .base import Adapter
from .helpers import date, text
from ..schemas import RawJob, SourceDiagnostic


def child_text(node, name):
    child = node.find(name)
    return (child.text or "").strip() if child is not None else ""


def parse_positions(xml_text: str, config: dict, host: str) -> list[RawJob]:
    root = ElementTree.fromstring(xml_text)
    rows = []
    for position in root.findall(".//position"):
        position_id = child_text(position, "id")
        if not position_id:
            continue
        descriptions = []
        for block in position.findall("./jobDescriptions/jobDescription"):
            heading, value = child_text(block, "name"), text(child_text(block, "value"))
            if value:
                descriptions.append(f"{heading}\n{value}" if heading else value)
        office = child_text(position, "office")
        schedule = child_text(position, "schedule")
        employment = child_text(position, "employmentType")
        detail_url = f"https://{host}/job/{position_id}?display=en"
        raw = {child.tag: child.text for child in position if child.tag != "jobDescriptions"}
        rows.append(RawJob(source_name=f"personio:{config['identifier']}", source_type="ats", source_job_id=position_id, source_url=detail_url, company_name=config["company"], company_domain=config.get("company_domain"), title=child_text(position, "name") or "Untitled", description="\n\n".join(descriptions), location_text=office, city=office or None, country="DE" if config.get("country") == "DE" else None, remote_type="Remote" if "remote" in office.casefold() else None, employment_type=" / ".join(value for value in (employment, schedule) if value), posted_at=date(child_text(position, "createdAt")), apply_url=detail_url, raw_data=raw))
    return rows


class PersonioAdapter(Adapter):
    parser_name = "Personio public XML feed"

    async def fetch(self, max_jobs=None):
        started = time.monotonic()
        slug = self.config["identifier"]
        hosts = [f"{slug}.jobs.personio.com", f"{slug}.jobs.personio.de"]
        error = None
        for host in hosts:
            try:
                response = await self.fetcher.get(f"https://{host}/xml?language=en", respect_robots=False)
                rows = parse_positions(response.text, self.config, host)
                rows = self.limited(rows, max_jobs)
                self.last_diagnostic = SourceDiagnostic(source=self.config["company"], http_status=response.status_code, parser=self.parser_name, discovered=len(rows), parsed=len(rows), duration_seconds=time.monotonic() - started)
                return rows
            except Exception as caught:
                error = caught
        raise error
