"""Normalize a supplied Lever CSV and remove canonical-registry duplicates."""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "data" / "german_company_ats_registry.json"
OUTPUT = ROOT / "data" / "candidates" / "lever_user_seed.csv"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    args = parser.parse_args()

    with args.input.open(encoding="utf-8-sig", newline="") as handle:
        supplied = list(csv.DictReader(handle))
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    existing = {row["board_identifier"].strip().casefold() for row in registry["records"] if row["ats_provider"] == "lever"}

    unique = {}
    internal_duplicates = []
    for row in supplied:
        slug = row.get("lever_slug", "").strip()
        if not slug:
            continue
        key = slug.casefold()
        normalized = {**row, "lever_slug": slug, "region": "eu" if "jobs.eu.lever.co" in row.get("board_url", "").casefold() else "global"}
        if key in unique:
            internal_duplicates.append(slug)
            continue
        unique[key] = normalized

    retained = [row for key, row in unique.items() if key not in existing]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    fields = ["company_name", "lever_slug", "region", "board_url", "german_locations_seen", "confidence", "notes"]
    with args.output.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows({field: row.get(field, "") for field in fields} for row in retained)

    print(json.dumps({"input_rows": len(supplied), "unique_slugs": len(unique), "internal_duplicates_removed": len(internal_duplicates), "registry_duplicates_removed": len(unique) - len(retained), "retained_new_candidates": len(retained), "output": str(args.output)}, indent=2))


if __name__ == "__main__":
    main()
