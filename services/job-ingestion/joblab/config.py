from __future__ import annotations

import os
from pathlib import Path
from typing import Any
import json

import yaml
from pydantic import BaseModel, Field

from .board_catalog import load_board_catalog, source_config

ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseModel):
    database_url: str = Field(default_factory=lambda: os.getenv("DATABASE_URL", f"sqlite:///{ROOT / 'german_jobs.db'}"))
    user_agent: str = Field(default_factory=lambda: os.getenv("CRAWLER_USER_AGENT", "JobDatabaseLab/0.1 (+local-test)"))
    per_domain_delay: float = Field(default_factory=lambda: float(os.getenv("PER_DOMAIN_DELAY_SECONDS", "1.0")))
    inactive_after_days: int = Field(default_factory=lambda: int(os.getenv("INACTIVE_AFTER_DAYS", "7")))
    target_country: str = Field(default_factory=lambda: os.getenv("TARGET_COUNTRY", "DE"))


def load_sources(path: str | Path | None = None) -> list[dict[str, Any]]:
    config_path = Path(path) if path else ROOT / "config" / "sources.yaml"
    data = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    sources: list[dict[str, Any]] = []
    for item in data.get("ats_sources", []):
        sources.append({"source_type": "ats", "enabled": True, **item})
    for item in data.get("career_pages", []):
        sources.append({"source_type": "generic", "enabled": True, **item})
    return sources


def load_registry_sources(provider: str, limit: int | None = None, path: str | Path | None = None) -> list[dict[str, Any]]:
    registry_path = Path(path) if path else ROOT / "data" / "german_company_ats_registry.json"
    if not registry_path.exists():
        catalog = load_board_catalog(ROOT / "config" / "boards.csv")
        sources = [source_config(row) for row in catalog if row.provider == provider and row.enabled]
        return sources[:limit] if limit is not None else sources
    document = json.loads(registry_path.read_text(encoding="utf-8"))
    rows = [row for row in document["records"] if row["ats_provider"] == provider and row["query_status"] == "queryable" and row["adapter_status"] == "working" and row["germany_status"] == "verified"]
    if limit is not None:
        rows = rows[:limit]
    return [{"source_type": "ats", "enabled": True, "company": row["company_name"], "provider": row["ats_provider"], "identifier": row["board_identifier"], "region": row["region"], "url": row["board_url"], "company_domain": row.get("company_domain"), **row.get("options", {})} for row in rows]
