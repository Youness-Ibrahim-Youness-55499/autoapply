from __future__ import annotations

import os
import csv
from pathlib import Path
from typing import Any
import json

import yaml
from pydantic import BaseModel, Field

from .board_catalog import load_board_catalog, source_config

ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseModel):
    database_url: str = Field(default_factory=lambda: os.getenv("DATABASE_URL", f"sqlite:///{ROOT / 'jobman_jobs.db'}"))
    user_agent: str = Field(default_factory=lambda: os.getenv("CRAWLER_USER_AGENT", "JobDatabaseLab/0.1 (+local-test)"))
    per_domain_delay: float = Field(default_factory=lambda: float(os.getenv("PER_DOMAIN_DELAY_SECONDS", "1.0")))
    inactive_after_days: int = Field(default_factory=lambda: int(os.getenv("INACTIVE_AFTER_DAYS", "7")))
    target_country: str = Field(default_factory=lambda: os.getenv("TARGET_COUNTRY", "DE"))

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        if self.database_url.startswith("postgres://"):
            return self.database_url.replace("postgres://", "postgresql+psycopg://", 1)
        return self.database_url

    @property
    def is_sqlite(self) -> bool:
        return self.sqlalchemy_database_url.startswith("sqlite")


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
        csv_path = (registry_path.with_suffix(".csv") if path
                    else ROOT / "data" / "validated_ats_sources.csv")
        if csv_path.exists():
            with csv_path.open(encoding="utf-8-sig", newline="") as handle:
                rows = list(csv.DictReader(handle))
        else:
            catalog = load_board_catalog(ROOT / "config" / "boards.csv")
            sources = [source_config(row) for row in catalog if row.provider == provider and row.enabled]
            return sources[:limit] if limit is not None else sources
    else:
        rows = json.loads(registry_path.read_text(encoding="utf-8"))["records"]
    rows = [row for row in rows if row["ats_provider"] == provider and row["query_status"] == "queryable" and row["adapter_status"] == "working" and row["germany_status"] == "verified"]
    if limit is not None:
        rows = rows[:limit]
    sources = []
    for row in rows:
        options = row.get("options", {})
        if isinstance(options, str):
            try: options = json.loads(options or "{}")
            except json.JSONDecodeError: options = {}
        identifier = row["board_identifier"]
        if row["ats_provider"] == "workday" and "|" not in identifier and "/" in identifier:
            identifier = identifier.replace("/", "|", 1)
        sources.append({"source_type": "ats", "enabled": True, "company": row["company_name"],
            "provider": row["ats_provider"], "identifier": identifier, "region": row["region"],
            "url": row["board_url"], "company_domain": row.get("company_domain") or None, **options})
    return sources


def load_custom_career_sources(limit: int | None = None, path: str | Path | None = None) -> list[dict[str, Any]]:
    registry_path = Path(path) if path else ROOT / "data" / "bavaria_custom_career_sources.csv"
    if not registry_path.exists(): return []
    with registry_path.open(encoding="utf-8-sig", newline="") as handle:
        rows = [row for row in csv.DictReader(handle) if row.get("enabled", "").casefold() == "true"]
    if limit is not None: rows = rows[:limit]
    return [{"source_type": "generic", "enabled": True, "company": row["company_name"],
             "company_domain": row.get("company_domain") or None, "url": row["career_url"]} for row in rows]
