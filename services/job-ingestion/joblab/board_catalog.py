"""Provider-neutral board catalog and endpoint construction."""
from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

from pydantic import BaseModel, Field, model_validator


SUPPORTED_PROVIDERS = frozenset({
    "ashby", "lever", "greenhouse", "smartrecruiters", "personio",
    "workday", "successfactors",
})
KNOWN_PROVIDERS = SUPPORTED_PROVIDERS | frozenset({
    "bamboohr", "dvinci", "onlyfy", "recruitee", "softgarden", "teamtailor",
})


class BoardInput(BaseModel):
    """Small, hand-editable input used to add a company board."""

    company: str = Field(min_length=1)
    provider: str = Field(min_length=1)
    identifier: str = Field(min_length=1)
    board_url: str | None = None
    company_domain: str | None = None
    region: str = "global"
    options: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_provider_configuration(self):
        self.provider = self.provider.strip().lower()
        self.identifier = self.identifier.strip()
        if self.provider not in KNOWN_PROVIDERS:
            raise ValueError(f"Unknown provider: {self.provider}")
        if self.provider == "workday" and "|" not in self.identifier:
            raise ValueError("Workday identifier must be tenant|career_site")
        if self.provider in {"workday", "successfactors"} and not self.board_url:
            raise ValueError(f"{self.provider} requires board_url")
        if self.provider == "lever" and self.region not in {"global", "eu"}:
            raise ValueError("Lever region must be global or eu")
        return self


class CatalogEntry(BoardInput):
    """Stable catalog data committed to Git; observations stay generated."""

    identifier: str = ""
    enabled: bool = True

    @model_validator(mode="after")
    def require_ingestion_identity(self):
        if self.enabled and not self.identifier:
            raise ValueError("Enabled boards require an identifier")
        return self


def load_board_catalog(path: str | Path) -> list[CatalogEntry]:
    with Path(path).open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    entries = []
    for row in rows:
        entries.append(CatalogEntry(
            company=row["company"],
            provider=row["provider"],
            identifier=row["identifier"],
            board_url=row.get("board_url") or None,
            company_domain=row.get("company_domain") or None,
            region=row.get("region") or "global",
            enabled=str(row.get("enabled", "true")).casefold() in {"1", "true", "yes"},
            options=json.loads(row.get("options") or "{}"),
        ))
    return entries


def board_url(board: BoardInput) -> str:
    if board.board_url:
        return board.board_url.rstrip("/")
    templates = {
        "ashby": "https://jobs.ashbyhq.com/{id}",
        "lever": "https://jobs.lever.co/{id}",
        "greenhouse": "https://boards.greenhouse.io/{id}",
        "smartrecruiters": "https://careers.smartrecruiters.com/{id}",
        "personio": "https://{id}.jobs.personio.com",
    }
    url = templates[board.provider].format(id=board.identifier)
    if board.provider == "lever" and board.region == "eu":
        return url.replace("jobs.lever.co", "jobs.eu.lever.co")
    return url


def api_url(board: BoardInput) -> str:
    identifier = board.identifier
    if board.provider == "ashby":
        return f"https://api.ashbyhq.com/posting-api/job-board/{identifier}?includeCompensation=true"
    if board.provider == "lever":
        host = "api.eu.lever.co" if board.region == "eu" else "api.lever.co"
        return f"https://{host}/v0/postings/{identifier}?mode=json"
    if board.provider == "greenhouse":
        return f"https://boards-api.greenhouse.io/v1/boards/{identifier}/jobs?content=true"
    if board.provider == "smartrecruiters":
        return f"https://api.smartrecruiters.com/v1/companies/{identifier}/postings?country=de"
    if board.provider == "personio":
        return f"https://{identifier}.jobs.personio.com/xml?language=en"
    if board.provider == "workday":
        tenant, site = identifier.split("|", 1)
        parts = urlsplit(board_url(board))
        return f"{parts.scheme}://{parts.netloc}/wday/cxs/{tenant}/{site}/jobs"
    if board.provider == "successfactors":
        mode = board.options.get("mode", "csb")
        return board_url(board) if mode == "legacy" else f"{board_url(board)}/services/recruiting/v1/jobs"
    return board_url(board)


def source_config(board: BoardInput) -> dict[str, Any]:
    return {
        "source_type": "ats",
        "enabled": True,
        "company": board.company,
        "provider": board.provider,
        "identifier": board.identifier,
        "region": board.region,
        "url": board_url(board),
        "company_domain": board.company_domain,
        **board.options,
    }
