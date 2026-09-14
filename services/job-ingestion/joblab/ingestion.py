from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .adapters import adapter_for
from .config import Settings
from .dedupe import fingerprint
from .fetching import FetchBlocked, PoliteFetcher
from .models import Company, IngestionRun, Job, JobSource, Source
from .location_filter import is_german_job
from .normalization import normalize_text, normalize_job
from .schemas import SourceDiagnostic

logger = logging.getLogger(__name__)


@dataclass
class IngestionReport:
    diagnostics: list[SourceDiagnostic] = field(default_factory=list)
    raw_jobs: int = 0
    new_jobs: int = 0
    duplicates: int = 0
    failed_sources: int = 0


def source_key(config):
    identity = config.get("identifier") or config.get("url")
    return f"{config.get('provider', config['source_type'])}:{identity}"


def get_or_create_company(db: Session, raw):
    normalized = normalize_text(raw.company_name)
    company = None
    if raw.company_domain:
        company = db.scalar(select(Company).where(Company.domain == raw.company_domain))
    if not company:
        company = db.scalar(select(Company).where(Company.normalized_name == normalized))
    if not company:
        company = Company(name=raw.company_name, normalized_name=normalized, domain=raw.company_domain)
        db.add(company); db.flush()
    return company


def get_or_create_source_company(db: Session, config):
    raw = SimpleNamespace(company_name=config["company"], company_domain=config.get("company_domain"))
    return get_or_create_company(db, raw)


def save_raw_job(db: Session, source: Source, raw, seen_at: datetime):
    raw = normalize_job(raw)
    occurrence = db.scalar(select(JobSource).where(JobSource.source_id == source.id, JobSource.source_job_id == raw.source_job_id))
    job = occurrence.job if occurrence else db.scalar(select(Job).where(Job.fingerprint == fingerprint(raw)))
    created = job is None
    if created:
        company = get_or_create_company(db, raw)
        job = Job(company_id=company.id, fingerprint=fingerprint(raw), title=raw.title, normalized_title=normalize_text(raw.title), description=raw.description, location_text=raw.location_text, city=raw.city, state=raw.state, country=raw.country, remote_type=raw.remote_type, employment_type=raw.employment_type, salary_min=float(raw.salary_min) if raw.salary_min is not None else None, salary_max=float(raw.salary_max) if raw.salary_max is not None else None, salary_currency=raw.salary_currency, posted_at=raw.posted_at, expires_at=raw.expires_at, apply_url=raw.apply_url, first_seen_at=seen_at, last_seen_at=seen_at)
        db.add(job); db.flush()
    else:
        job.last_seen_at = seen_at; job.status = "active"
        if len(raw.description) > len(job.description or ""): job.description = raw.description
    if occurrence:
        occurrence.raw_data = raw.raw_data; occurrence.retrieved_at = raw.retrieved_at; occurrence.last_seen_at = seen_at; occurrence.job_id = job.id
    else:
        db.add(JobSource(job_id=job.id, source_id=source.id, source_job_id=raw.source_job_id, source_url=raw.source_url, raw_data=raw.raw_data, retrieved_at=raw.retrieved_at, last_seen_at=seen_at))
    return created


async def ingest(configs, db: Session, max_jobs: int | None = None, settings: Settings | None = None):
    settings = settings or Settings()
    fetcher = PoliteFetcher(settings.user_agent, settings.per_domain_delay)
    report = IngestionReport()
    configs = list(configs)
    providers = {config.get("provider", config.get("source_type", "unknown")) for config in configs}
    run = IngestionRun(provider=next(iter(providers)) if len(providers) == 1 else "mixed", sources_attempted=len(configs))
    db.add(run)
    db.commit()
    try:
        for config in configs:
            if not config.get("enabled", True): continue
            key = source_key(config)
            source = db.scalar(select(Source).where(Source.key == key))
            if not source:
                company = get_or_create_source_company(db, config)
                source = Source(company_id=company.id, key=key, company_name=config["company"], source_type=config["source_type"], provider=config.get("provider"), url=config.get("url"), enabled=True)
                db.add(source); db.flush()
            source.last_run_at = datetime.now(UTC)
            logger.info("source start: %s", key)
            started = time.monotonic()
            try:
                adapter = adapter_for(config, fetcher)
                # SmartRecruiters accepts country=de at the source, so its
                # limit can be applied before fetching individual details.
                fetch_limit = max_jobs if config.get("provider") in {"smartrecruiters", "successfactors", "workday"} else None
                discovered_rows = await adapter.fetch(max_jobs=fetch_limit)
                rows = [row for row in discovered_rows if is_german_job(row)]
                if max_jobs:
                    rows = rows[:max_jobs]
                report.raw_jobs += len(rows)
                seen_at = datetime.now(UTC)
                for raw in rows:
                    if save_raw_job(db, source, raw, seen_at): report.new_jobs += 1
                    else: report.duplicates += 1
                diagnostic = adapter.last_diagnostic
                diagnostic.parsed = len(rows)
                source.last_success_at = seen_at; source.last_http_status = diagnostic.http_status; source.last_jobs_found = len(rows); source.last_error = None
                db.commit(); logger.info("source completion: %s jobs=%d", key, len(rows))
            except Exception as error:
                db.rollback(); report.failed_sources += 1
                source = db.scalar(select(Source).where(Source.key == key))
                source.last_run_at = datetime.now(UTC); source.last_error = str(error); source.last_http_status = int(str(error).split()[1].rstrip(";")) if isinstance(error, FetchBlocked) and str(error).startswith("HTTP ") else None
                db.commit()
                diagnostic = SourceDiagnostic(source=config["company"], parser=config.get("provider", "generic"), duration_seconds=time.monotonic()-started, error=str(error))
                logger.warning("source failed: %s: %s", key, error)
            report.diagnostics.append(diagnostic)
    finally:
        await fetcher.close()
    cutoff = datetime.now(UTC) - timedelta(days=settings.inactive_after_days)
    for job in db.scalars(select(Job).where(Job.last_seen_at < cutoff, Job.status == "active")):
        job.status = "inactive"
    run.status = "completed_with_errors" if report.failed_sources else "completed"
    run.completed_at = datetime.now(UTC)
    run.raw_jobs = report.raw_jobs
    run.new_jobs = report.new_jobs
    run.duplicates = report.duplicates
    run.failed_sources = report.failed_sources
    db.commit()
    return report


def database_counts(db: Session):
    return {"companies": db.scalar(select(func.count(Company.id))), "canonical_jobs": db.scalar(select(func.count(Job.id))), "source_occurrences": db.scalar(select(func.count(JobSource.id)))}
