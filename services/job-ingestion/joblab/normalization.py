import re
import unicodedata
from urllib.parse import urlparse

from .schemas import RawJob


def normalize_text(value: str | None) -> str:
    value = unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def normalize_domain(value: str | None) -> str:
    if not value:
        return ""
    parsed = urlparse(value if "://" in value else f"https://{value}")
    return parsed.netloc.lower().removeprefix("www.")


def normalize_job(job: RawJob) -> RawJob:
    job.title = " ".join(job.title.split())
    job.company_name = " ".join(job.company_name.split())
    job.company_domain = normalize_domain(job.company_domain) or None
    job.location_text = " ".join(job.location_text.split())
    if job.remote_type:
        job.remote_type = normalize_text(job.remote_type)
    return job
