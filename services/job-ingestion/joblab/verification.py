from __future__ import annotations

from dataclasses import dataclass, field
from time import monotonic


@dataclass
class VerificationProgress:
    provider: str
    total: int
    checked: int = 0
    verified: int = 0
    failed: int = 0
    skipped: int = 0
    started_at: float = field(default_factory=monotonic)

    def record(self, outcome: str):
        self.checked += 1
        if outcome == "verified": self.verified += 1
        elif outcome == "skipped": self.skipped += 1
        else: self.failed += 1

    def line(self):
        elapsed = max(monotonic() - self.started_at, 0.001)
        return f"{self.provider}: {self.checked}/{self.total} checked | {self.verified} verified | {self.failed} failed | {self.skipped} skipped | {self.checked / elapsed:.2f}/s"
