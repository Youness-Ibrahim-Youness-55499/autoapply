from __future__ import annotations

from abc import ABC, abstractmethod

from ..fetching import PoliteFetcher
from ..schemas import RawJob, SourceDiagnostic


class Adapter(ABC):
    parser_name = "unknown"

    def __init__(self, config: dict, fetcher: PoliteFetcher):
        self.config = config
        self.fetcher = fetcher
        self.last_diagnostic = SourceDiagnostic(source=config["company"], parser=self.parser_name)

    @abstractmethod
    async def fetch(self, max_jobs: int | None = None) -> list[RawJob]: ...

    def limited(self, rows: list, max_jobs: int | None):
        return rows[:max_jobs] if max_jobs else rows
