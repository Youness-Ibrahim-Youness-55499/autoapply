"""Validate and add one board to the local extension catalog."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from joblab.board_catalog import BoardInput, api_url, board_url

CATALOG = ROOT / "config" / "custom_boards.yaml"


def main() -> None:
    parser = argparse.ArgumentParser(description="Add an ATS board without editing Python code")
    parser.add_argument("--company", required=True)
    parser.add_argument("--provider", required=True)
    parser.add_argument("--identifier", required=True)
    parser.add_argument("--board-url")
    parser.add_argument("--company-domain")
    parser.add_argument("--region", default="global")
    parser.add_argument("--mode", choices=("csb", "legacy"))
    args = parser.parse_args()
    options = {"mode": args.mode} if args.mode else {}
    candidate = BoardInput(company=args.company, provider=args.provider, identifier=args.identifier, board_url=args.board_url, company_domain=args.company_domain, region=args.region, options=options)

    document = yaml.safe_load(CATALOG.read_text(encoding="utf-8")) if CATALOG.exists() else {}
    rows = document.get("boards", [])
    identity = (candidate.provider, candidate.identifier.casefold())
    if any((str(row.get("provider", "")).casefold(), str(row.get("identifier", "")).casefold()) == identity for row in rows):
        parser.error(f"board already exists: {candidate.provider}|{candidate.identifier}")
    rows.append(candidate.model_dump(exclude_none=True))
    CATALOG.write_text(yaml.safe_dump({"boards": rows}, sort_keys=False, allow_unicode=True), encoding="utf-8")
    print(f"Added {candidate.company} ({candidate.provider})")
    print(f"Board: {board_url(candidate)}")
    print(f"Endpoint: {api_url(candidate)}")
    print("Next: run scripts/verify_custom_boards.py")


if __name__ == "__main__":
    main()
