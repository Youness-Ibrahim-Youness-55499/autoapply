from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from joblab.registry import RegistryDocument, merge_records, validation_summary


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path", nargs="?", default=ROOT / "data" / "german_company_ats_registry.json")
    args = parser.parse_args()
    raw = json.loads(Path(args.path).read_text(encoding="utf-8"))
    document = RegistryDocument.model_validate(raw)
    _, duplicates = merge_records(document.records)
    report = validation_summary(document, duplicates)
    print(json.dumps(report, indent=2, default=str))
    raise SystemExit(0 if report["valid"] else 1)


if __name__ == "__main__": main()
