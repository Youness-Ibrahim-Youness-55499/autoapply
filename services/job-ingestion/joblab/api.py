import json
import csv
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from .db import get_db, init_db
from .board_catalog import api_url, board_url, load_board_catalog
from .models import Company, Job, JobSource, Source
from .providers import PROVIDERS

WEB = Path(__file__).resolve().parents[1] / "web"
REGISTRY = Path(__file__).resolve().parents[1] / "data" / "german_company_ats_registry.json"
DISCOVERIES = REGISTRY.parent / "discoveries"
CUSTOM_CAREERS = REGISTRY.parent / "bavaria_custom_career_sources.csv"
ATS_REGISTRY_CSV = REGISTRY.parent / "validated_ats_sources.csv"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Job Database Lab", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health(): return {"status": "ok"}


@app.get("/", include_in_schema=False)
def home(): return FileResponse(WEB / "index.html")


def serialize_job(job: Job):
    providers = sorted({occurrence.source.provider for occurrence in job.occurrences if occurrence.source.provider})
    return {"id": job.id, "title": job.title, "company": job.company.name, "location": job.location_text, "city": job.city, "country": job.country, "remote_type": job.remote_type, "employment_type": job.employment_type, "status": job.status, "apply_url": job.apply_url, "posted_at": job.posted_at, "last_seen_at": job.last_seen_at, "provider": providers[0] if len(providers) == 1 else "multiple", "source_count": len(job.occurrences)}


@app.get("/jobs")
def jobs(q: str | None = None, title: str | None = None, company: str | None = None, city: str | None = None, country: str | None = None, remote_type: str | None = None, source: str | None = None, status: str | None = "active", limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    query = select(Job).join(Company)
    if source: query = query.join(JobSource).join(Source).where(Source.provider == source)
    if q:
        search = f"%{q.strip()}%"
        query = query.where(
            or_(
                Job.title.ilike(search),
                Company.name.ilike(search),
                Job.location_text.ilike(search),
            )
        )
    if title: query = query.where(Job.title.ilike(f"%{title}%"))
    if company: query = query.where(Company.name.ilike(f"%{company}%"))
    if city: query = query.where(Job.city.ilike(f"%{city}%"))
    if country:
        normalized_country = country.strip().casefold()
        if normalized_country in {"de", "deu", "germany", "deutschland"}:
            query = query.where(
                or_(
                    Job.country.ilike("DE"),
                    Job.country.ilike("DEU"),
                    Job.country.ilike("Germany"),
                    Job.country.ilike("Deutschland"),
                )
            )
        else:
            query = query.where(Job.country.ilike(f"%{country}%"))
    if remote_type: query = query.where(Job.remote_type == remote_type)
    if status: query = query.where(Job.status == status)
    rows = db.scalars(query.distinct().order_by(Job.id).limit(limit + 1).offset(offset)).all()
    return {
        "items": [serialize_job(row) for row in rows[:limit]],
        "has_more": len(rows) > limit,
        "limit": limit,
        "offset": offset,
    }


@app.get("/jobs/{job_id}")
def job(job_id: int, db: Session = Depends(get_db)):
    row = db.get(Job, job_id)
    if not row: raise HTTPException(404, "Job not found")
    return {**serialize_job(row), "description": row.description, "sources": [{"source_id": occurrence.source_id, "source_job_id": occurrence.source_job_id, "source_url": occurrence.source_url} for occurrence in row.occurrences]}


@app.get("/companies")
def companies(limit: int = Query(100, ge=1, le=500), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    rows = db.scalars(select(Company).order_by(Company.name).limit(limit).offset(offset)).all()
    return [{"id": row.id, "name": row.name, "domain": row.domain, "job_count": len(row.jobs)} for row in rows]


@app.get("/companies/{company_id}/jobs")
def company_jobs(company_id: int, db: Session = Depends(get_db)):
    company = db.get(Company, company_id)
    if not company: raise HTTPException(404, "Company not found")
    return [serialize_job(row) for row in company.jobs]


@app.get("/sources")
def sources(db: Session = Depends(get_db)):
    return [{"id": row.id, "key": row.key, "company_name": row.company_name, "source_type": row.source_type, "provider": row.provider, "url": row.url, "enabled": row.enabled} for row in db.scalars(select(Source)).all()]


@app.get("/providers")
def providers(): return PROVIDERS


@app.get("/company-boards")
def company_boards(provider: str | None = None, status: str | None = None, query: str | None = None, limit: int = Query(100, ge=1, le=5000), offset: int = Query(0, ge=0)):
    merged = {}
    catalog_path = REGISTRY.parents[1] / "config" / "boards.csv"
    if catalog_path.exists():
        for entry in load_board_catalog(catalog_path):
            row = {
                "company_name": entry.company,
                "company_domain": entry.company_domain,
                "ats_provider": entry.provider,
                "board_identifier": entry.identifier,
                "board_url": board_url(entry),
                "api_url": api_url(entry),
                "region": entry.region,
                "query_status": "queryable" if entry.enabled else "disabled",
                "germany_status": "catalogued",
                "adapter_status": "working" if entry.enabled else "unavailable",
                "source_layer": "catalog",
            }
            identity = entry.identifier or board_url(entry)
            merged[(entry.provider, identity.casefold())] = row
    documents = [(REGISTRY, "registry")]
    documents.extend((path, "discovery") for path in sorted(DISCOVERIES.glob("*.json")))
    for path, source_layer in documents:
        try:
            rows = json.loads(path.read_text(encoding="utf-8")).get("records", [])
        except (OSError, json.JSONDecodeError):
            continue
        for row in rows:
            identifier = row.get("board_identifier") or row.get("board_url", "")
            key = (row.get("ats_provider", ""), identifier.casefold())
            merged[key] = {**row, "source_layer": source_layer}
    registry_csv = ATS_REGISTRY_CSV
    if registry_csv.exists():
        with registry_csv.open(encoding="utf-8-sig", newline="") as handle:
            for row in csv.DictReader(handle):
                identifier = row.get("board_identifier") or row.get("board_url", "")
                key = (row.get("ats_provider", ""), identifier.casefold())
                merged[key] = {**row, "source_layer": "registry"}
    records = sorted(merged.values(), key=lambda row: (row["ats_provider"], row["company_name"].casefold()))
    if provider: records = [row for row in records if row["ats_provider"] == provider]
    if status: records = [row for row in records if row["query_status"] == status]
    if query:
        needle = query.casefold()
        records = [row for row in records if needle in f"{row['company_name']} {row['board_identifier']} {row['board_url']}".casefold()]
    return {"total": len(records), "limit": limit, "offset": offset, "items": records[offset:offset + limit]}


@app.get("/custom-career-sources")
def custom_career_sources(status: str | None = None, limit: int = Query(100, ge=1, le=1000), offset: int = Query(0, ge=0)):
    if not CUSTOM_CAREERS.exists(): return {"total": 0, "limit": limit, "offset": offset, "items": []}
    with CUSTOM_CAREERS.open(encoding="utf-8-sig", newline="") as handle:
        records = list(csv.DictReader(handle))
    if status: records = [row for row in records if row["source_status"] == status]
    return {"total": len(records), "limit": limit, "offset": offset, "items": records[offset:offset + limit]}


@app.get("/sources/status")
def source_status(db: Session = Depends(get_db)):
    return [{"id": row.id, "key": row.key, "last_run_at": row.last_run_at, "last_success_at": row.last_success_at, "last_http_status": row.last_http_status, "last_jobs_found": row.last_jobs_found, "last_error": row.last_error} for row in db.scalars(select(Source)).all()]


@app.get("/stats")
def stats(db: Session = Depends(get_db)):
    return {"companies": db.scalar(select(func.count(Company.id))), "canonical_jobs": db.scalar(select(func.count(Job.id))), "source_occurrences": db.scalar(select(func.count(JobSource.id)),), "active_jobs": db.scalar(select(func.count(Job.id)).where(Job.status == "active")), "inactive_jobs": db.scalar(select(func.count(Job.id)).where(Job.status == "inactive"))}


app.mount("/static", StaticFiles(directory=WEB), name="static")
