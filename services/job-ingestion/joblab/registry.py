from __future__ import annotations

import hashlib
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any
from urllib.parse import urlsplit, urlunsplit

from pydantic import BaseModel, Field, field_validator, model_validator


class DiscoveryStatus(StrEnum):
    DISCOVERED = "discovered"


class EndpointStatus(StrEnum):
    IDENTIFIED = "identified"
    MISSING = "missing"
    INVALID = "invalid"


class QueryStatus(StrEnum):
    QUERYABLE = "queryable"
    ADAPTER_REQUIRED = "adapter_required"
    AUTH_REQUIRED = "auth_required"
    BLOCKED = "blocked"
    UNTESTED = "untested"


class GermanyStatus(StrEnum):
    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    NO_GERMAN_JOBS = "no_german_jobs"


class AdapterStatus(StrEnum):
    WORKING = "working"
    REQUIRED = "required"


class BoardRecord(BaseModel):
    record_id: str = ""
    company_name: str = Field(min_length=1)
    company_domain: str | None = None
    ats_provider: str = Field(min_length=1)
    board_identifier: str = ""
    board_url: str = Field(min_length=8)
    api_url: str = ""
    region: str = "global"
    discovery_status: DiscoveryStatus = DiscoveryStatus.DISCOVERED
    endpoint_status: EndpointStatus
    query_status: QueryStatus
    germany_status: GermanyStatus
    adapter_status: AdapterStatus
    german_jobs_at_check: int | None = Field(default=None, ge=0)
    total_jobs_at_check: int | None = Field(default=None, ge=0)
    sample_locations: list[str] = Field(default_factory=list)
    germany_evidence: str = ""
    last_checked_at: datetime | None = None
    last_http_status: int | None = Field(default=None, ge=100, le=599)
    verification_error: str | None = None
    provenance: str = ""
    notes: str = ""
    options: dict[str, Any] = Field(default_factory=dict)

    @field_validator("ats_provider")
    @classmethod
    def normalize_provider(cls, value: str): return value.strip().lower()

    @field_validator("board_url", "api_url")
    @classmethod
    def normalize_url(cls, value: str):
        if not value or not value.startswith(("http://", "https://")): return value
        parts = urlsplit(value.strip())
        return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), parts.path.rstrip("/") or "/", parts.query, ""))

    @model_validator(mode="after")
    def validate_states(self):
        if self.query_status == QueryStatus.QUERYABLE and self.endpoint_status != EndpointStatus.IDENTIFIED:
            raise ValueError("Queryable boards require an identified endpoint")
        if self.germany_status == GermanyStatus.VERIFIED and not self.germany_evidence:
            raise ValueError("Verified German boards require evidence")
        if not self.record_id:
            identity = f"{self.ats_provider}|{(self.board_identifier or self.board_url).casefold()}"
            self.record_id = hashlib.sha256(identity.encode()).hexdigest()[:20]
        return self

    @property
    def canonical_key(self): return self.ats_provider, (self.board_identifier or self.board_url).casefold()

    @property
    def ingestion_ready(self):
        return self.query_status == QueryStatus.QUERYABLE and self.adapter_status == AdapterStatus.WORKING and self.germany_status == GermanyStatus.VERIFIED


class RegistryDocument(BaseModel):
    schema_version: int = 2
    generated_at: datetime
    definition: str
    records: list[BoardRecord]

    @property
    def record_count(self): return len(self.records)


def merge_records(records: list[BoardRecord]):
    unique: dict[tuple[str, str], BoardRecord] = {}
    duplicates: list[dict[str, Any]] = []
    for record in records:
        existing = unique.get(record.canonical_key)
        if existing:
            duplicates.append({"canonical_key": "|".join(record.canonical_key), "kept": existing.record_id, "discarded": record.record_id})
            floor = datetime.min.replace(tzinfo=UTC)
            if (record.last_checked_at or floor) > (existing.last_checked_at or floor):
                unique[record.canonical_key] = record
        else:
            unique[record.canonical_key] = record
    return sorted(unique.values(), key=lambda item: (item.ats_provider, item.company_name.casefold())), duplicates


def validation_summary(document: RegistryDocument, duplicates: list[dict[str, Any]] | None = None):
    records = document.records
    return {
        "valid": not duplicates,
        "schema_version": document.schema_version,
        "records": len(records),
        "providers": len({row.ats_provider for row in records}),
        "ingestion_ready": sum(row.ingestion_ready for row in records),
        "endpoint_identified": sum(row.endpoint_status == EndpointStatus.IDENTIFIED for row in records),
        "germany_verified": sum(row.germany_status == GermanyStatus.VERIFIED for row in records),
        "duplicates": duplicates or [],
    }
