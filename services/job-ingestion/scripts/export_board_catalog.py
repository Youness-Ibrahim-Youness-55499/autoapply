"""Export stable board configuration from the generated verification registry."""
from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "german_company_ats_registry.json"
OUTPUT = ROOT / "config" / "boards.csv"
FIELDS = ("company", "provider", "identifier", "board_url", "region", "company_domain", "enabled", "options")


def main() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    rows = []
    for item in document["records"]:
        ready = item["query_status"] == "queryable" and item["adapter_status"] == "working" and item["germany_status"] == "verified"
        rows.append({
            "company": item["company_name"],
            "provider": item["ats_provider"],
            "identifier": item["board_identifier"],
            "board_url": item["board_url"],
            "region": item.get("region", "global"),
            "company_domain": item.get("company_domain") or "",
            "enabled": str(ready).lower(),
            "options": json.dumps(item.get("options") or {}, separators=(",", ":")),
        })
    rows.sort(key=lambda row: (row["provider"], row["company"].casefold()))
    with OUTPUT.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Exported {len(rows)} boards to {OUTPUT}")


if __name__ == "__main__":
    main()
