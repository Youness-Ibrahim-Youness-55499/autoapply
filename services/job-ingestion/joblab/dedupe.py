import hashlib
from difflib import SequenceMatcher

from .normalization import normalize_text
from .schemas import RawJob


def fingerprint(job: RawJob) -> str:
    company = job.company_domain or normalize_text(job.company_name)
    title = normalize_text(job.title)
    place = normalize_text(job.city or job.location_text)
    return hashlib.sha256(f"{company}|{title}|{place}".encode()).hexdigest()


def secondary_title_match(left: str, right: str, threshold: float = 0.92) -> bool:
    return SequenceMatcher(None, normalize_text(left), normalize_text(right)).ratio() >= threshold
