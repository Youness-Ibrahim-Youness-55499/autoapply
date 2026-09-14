from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field


class RawJob(BaseModel):
    source_name: str
    source_type: str
    source_job_id: str
    source_url: str
    company_name: str
    company_domain: str | None = None
    title: str
    description: str = ""
    location_text: str = ""
    city: str | None = None
    state: str | None = None
    country: str | None = None
    remote_type: str | None = None
    employment_type: str | None = None
    salary_min: Decimal | None = None
    salary_max: Decimal | None = None
    salary_currency: str | None = None
    posted_at: datetime | None = None
    expires_at: datetime | None = None
    apply_url: str | None = None
    raw_data: dict[str, Any] = Field(default_factory=dict)
    retrieved_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class SourceDiagnostic(BaseModel):
    source: str
    http_status: int | None = None
    parser: str
    discovered: int = 0
    parsed: int = 0
    failed: int = 0
    duration_seconds: float = 0
    error: str | None = None
