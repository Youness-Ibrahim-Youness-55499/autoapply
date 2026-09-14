import json
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .db import get_db, init_db
from .board_catalog import api_url, board_url, load_board_catalog
from .models import Company, Job, JobSource, Source
from .providers import PROVIDERS

app = FastAPI(title="Job Database Lab", version="0.1.0")
WEB = Path(__file__).resolve().parents[1] / "web"
REGISTRY = Path(__file__).resolve().parents[1] / "data" / "german_company_ats_registry.json"
DISCOVERIES = REGISTRY.parent / "discoveries"


@app.on_event("startup")
def startup(): init_db()


@app.get("/health")
def health(): return {"status": "ok"}


@app.get("/", include_in_schema=False)
def home(): return FileResponse(WEB / "index.html")


def serialize_job(job: Job):
    return {"id": job.id, "title": job.title, "company": job.company.name, "location": job.location_text, "city": job.city, "country": job.country, "remote_type": job.remote_type, "employment_type": job.employment_type, "status": job.status, "apply_url": job.apply_url, "posted_at": job.posted_at, "last_seen_at": job.last_seen_at, "source_count": len(job.occurrences)}


@app.get("/jobs")
def jobs(title: str | None = None, company: str | None = None, city: str | None = None, country: str | None = None, remote_type: str | None = None, source: str | None = None, status: str | None = "active", limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    query = select(Job).join(Company)
    if source: query = query.join(JobSource).join(Source).where(Source.provider == source)
    if title: query = query.where(Job.title.ilike(f"%{title}%"))
    if company: query = query.where(Company.name.ilike(f"%{company}%"))
    if city: query = query.where(Job.city.ilike(f"%{city}%"))
    if country: query = query.where(Job.country.ilike(f"%{country}%"))
    if remote_type: query = query.where(Job.remote_type == remote_type)
    if status: query = query.where(Job.status == status)
    rows = db.scalars(query.distinct().limit(limit).offset(offset)).all()
    return {"items": [serialize_job(row) for row in rows], "limit": limit, "offset": offset}


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
    records = sorted(merged.values(), key=lambda row: (row["ats_provider"], row["company_name"].casefold()))
    if provider: records = [row for row in records if row["ats_provider"] == provider]
    if status: records = [row for row in records if row["query_status"] == status]
    if query:
        needle = query.casefold()
        records = [row for row in records if needle in f"{row['company_name']} {row['board_identifier']} {row['board_url']}".casefold()]
    return {"total": len(records), "limit": limit, "offset": offset, "items": records[offset:offset + limit]}


@app.get("/sources/status")
def source_status(db: Session = Depends(get_db)):
    return [{"id": row.id, "key": row.key, "last_run_at": row.last_run_at, "last_success_at": row.last_success_at, "last_http_status": row.last_http_status, "last_jobs_found": row.last_jobs_found, "last_error": row.last_error} for row in db.scalars(select(Source)).all()]


@app.get("/stats")
def stats(db: Session = Depends(get_db)):
    return {"companies": db.scalar(select(func.count(Company.id))), "canonical_jobs": db.scalar(select(func.count(Job.id))), "source_occurrences": db.scalar(select(func.count(JobSource.id)),), "active_jobs": db.scalar(select(func.count(Job.id)).where(Job.status == "active")), "inactive_jobs": db.scalar(select(func.count(Job.id)).where(Job.status == "inactive"))}


app.mount("/static", StaticFiles(directory=WEB), name="static")
