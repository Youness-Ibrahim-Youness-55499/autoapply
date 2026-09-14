"""Build a merge-ready registry from verified local discovery plus reviewed boards."""
from __future__ import annotations

import csv
import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data"
sys.path.insert(0, str(ROOT))

from joblab.registry import AdapterStatus, BoardRecord, EndpointStatus, GermanyStatus, QueryStatus, RegistryDocument, merge_records, validation_summary
from joblab.board_catalog import SUPPORTED_PROVIDERS, api_url as catalog_api_url, board_url as catalog_board_url, load_board_catalog

SUPPLEMENTAL = [
    # Greenhouse
    ("Atolls", "greenhouse", "atolls", "https://boards.greenhouse.io/atolls", "query_ready", "Germany locations verified"),
    ("HelloFresh", "greenhouse", "hellofresh", "https://boards.greenhouse.io/hellofresh", "query_ready", "Berlin, Germany jobs verified"),
    ("GetYourGuide", "greenhouse", "getyourguide", "https://boards.greenhouse.io/getyourguide", "query_ready", "Berlin, Germany jobs verified"),
    # SmartRecruiters
    ("ATLAS", "smartrecruiters", "ATLAS4", "https://careers.smartrecruiters.com/ATLAS4", "query_ready", "German locations verified"),
    ("Flink", "smartrecruiters", "Flink3", "https://careers.smartrecruiters.com/Flink3", "query_ready", "German locations verified"),
    ("McMakler", "smartrecruiters", "mcmakler1", "https://careers.smartrecruiters.com/mcmakler1", "query_ready", "German locations verified"),
    ("Securitas Germany", "smartrecruiters", "securitas", "https://careers.smartrecruiters.com/securitas", "query_ready", "German locations verified"),
    # Personio XML feeds
    ("Capmo", "personio", "capmo", "https://capmo.jobs.personio.de/xml?language=en", "query_ready", "Munich, Berlin and Germany-remote jobs verified"),
    ("Carlsquare GmbH", "personio", "carlsquare-gmbh", "https://carlsquare-gmbh.jobs.personio.de/xml?language=en", "query_ready", "Multiple German locations verified"),
    ("BeWunder", "personio", "bewunder", "https://bewunder.jobs.personio.de/xml?language=en", "query_ready", "Berlin, Munich and Hamburg jobs verified"),
    ("hakuna", "personio", "hakuna", "https://hakuna.jobs.personio.de/xml?language=en", "query_ready", "Munich and Berlin jobs verified"),
    ("Circus", "personio", "circus", "https://circus.jobs.personio.de/xml?language=en", "query_ready", "Munich, Berlin and Stuttgart jobs verified"),
    # Workday tenant + career-site identifiers
    ("BERNER Group", "workday", "bernergroup|Careers_Berner_Group", "https://bernergroup.wd3.myworkdayjobs.com/Careers_Berner_Group", "query_ready", "Berlin, Germany job verified"),
    ("Equinor", "workday", "equinor|EQNR", "https://equinor.wd3.myworkdayjobs.com/EQNR", "query_ready", "Berlin, Germany job verified"),
    ("The Coca-Cola Company", "workday", "coke|coca-cola-careers", "https://coke.wd1.myworkdayjobs.com/coca-cola-careers", "query_ready", "Germany job verified"),
    ("Levi Strauss & Co.", "workday", "levistraussandco|External", "https://levistraussandco.wd5.myworkdayjobs.com/External", "query_ready", "Berlin, Germany job verified"),
    ("Zeppelin", "workday", "zeppelin|careers", "https://zeppelin.wd3.myworkdayjobs.com/careers", "query_ready", "German jobs verified"),
    ("Motorola Solutions", "workday", "motorolasolutions|Careers", "https://motorolasolutions.wd5.myworkdayjobs.com/Careers", "query_ready", "Berlin, Germany job verified"),
    # Other hosted boards; exact URLs verified, adapters still required.
    ("softgarden e-recruiting", "softgarden", "softgarden.career", "https://softgarden.career.softgarden.de/en/", "query_ready_needs_adapter", "Six German-oriented vacancies reported"),
    ("EUROPART", "dvinci", "europart-karriere", "https://europart-karriere.dvinci-hr.com/de/jobs", "query_ready_needs_adapter", "German vacancies verified"),
    ("Meyer Burger", "successfactors", "MeyerBurger", "https://api012.successfactors.eu/career?company=MeyerBurger", "discovered_needs_validation", "Tenant identified; public page currently errors"),
    # onlyfy embeds discovered on company career sites; direct board id remains to resolve.
    ("ABRAMS Industries", "onlyfy", "", "https://de.abrams-industries.com/karriere/", "discovered_needs_identifier", "onlyfy embed confirmed"),
    ("KET", "onlyfy", "", "https://www.ket-muc.com/karriere-ket/", "discovered_needs_identifier", "onlyfy embed confirmed"),
    ("Klingenthal", "onlyfy", "", "https://www.klingenthal.com/karriere/stellenangebote", "discovered_needs_identifier", "onlyfy embed confirmed"),
    ("Mediengruppe Westfälischer Anzeiger", "onlyfy", "", "https://wa-mediengruppe.de/stellenangebote/", "discovered_needs_identifier", "onlyfy embed confirmed"),
    ("Dürr Dental", "onlyfy", "", "https://www.duerrdental.com/de/DE/karriere/stellenangebote/", "discovered_needs_identifier", "onlyfy embed confirmed"),
]


def row(company, provider, board_id, board_url, status, evidence, **extra):
    endpoint_status = EndpointStatus.MISSING if status == "discovered_needs_identifier" else EndpointStatus.IDENTIFIED
    query_status = {"query_ready": QueryStatus.QUERYABLE, "query_ready_needs_adapter": QueryStatus.ADAPTER_REQUIRED, "discovered_needs_validation": QueryStatus.UNTESTED, "discovered_needs_identifier": QueryStatus.UNTESTED}[status]
    adapter_status = AdapterStatus.WORKING if provider in {"ashby", "lever", "greenhouse", "smartrecruiters", "personio", "workday", "successfactors"} else AdapterStatus.REQUIRED
    germany_status = GermanyStatus.UNVERIFIED if status in {"discovered_needs_validation", "discovered_needs_identifier"} else GermanyStatus.VERIFIED
    return BoardRecord(company_name=company, ats_provider=provider, board_identifier=board_id, board_url=board_url, api_url=api_url(provider, board_id, board_url), region=extra.get("region", "global"), endpoint_status=endpoint_status, query_status=query_status, germany_status=germany_status, adapter_status=adapter_status, german_jobs_at_check=extra.get("german_jobs"), total_jobs_at_check=extra.get("total_jobs"), sample_locations=extra.get("sample_locations", []), germany_evidence=evidence, last_checked_at=extra.get("checked_at"), provenance=extra.get("provenance", "reviewed public careers source"), notes=extra.get("notes", ""))


def api_url(provider, board_id, board_url=""):
    if provider == "ashby": return f"https://api.ashbyhq.com/posting-api/job-board/{board_id}?includeCompensation=true"
    if provider == "lever": return f"https://api.lever.co/v0/postings/{board_id}?mode=json"
    if provider == "greenhouse": return f"https://boards-api.greenhouse.io/v1/boards/{board_id}/jobs?content=true"
    if provider == "smartrecruiters": return f"https://api.smartrecruiters.com/v1/companies/{board_id}/postings?country=de"
    if provider == "personio": return f"https://{board_id}.jobs.personio.com/xml?language=en"
    if provider == "workday" and "|" in board_id:
        tenant, site = board_id.split("|", 1)
        parts = urlsplit(board_url)
        return f"{parts.scheme}://{parts.netloc}/wday/cxs/{tenant}/{site}/jobs"
    return ""


def main():
    registry_path = OUT / "german_company_ats_registry.json"
    if registry_path.exists():
        current = RegistryDocument.model_validate_json(registry_path.read_text(encoding="utf-8"))
        records = list(current.records)
    else:
        records = []
        for entry in load_board_catalog(ROOT / "config" / "boards.csv"):
            records.append(BoardRecord(
                company_name=entry.company,
                company_domain=entry.company_domain,
                ats_provider=entry.provider,
                board_identifier=entry.identifier,
                board_url=catalog_board_url(entry),
                api_url=catalog_api_url(entry),
                region=entry.region,
                endpoint_status=EndpointStatus.IDENTIFIED,
                query_status=QueryStatus.QUERYABLE if entry.enabled else QueryStatus.UNTESTED,
                germany_status=GermanyStatus.VERIFIED if entry.enabled else GermanyStatus.UNVERIFIED,
                adapter_status=AdapterStatus.WORKING if entry.provider in SUPPORTED_PROVIDERS else AdapterStatus.REQUIRED,
                germany_evidence="Curated from a prior live German-job verification" if entry.enabled else "",
                provenance="Version-controlled board catalog",
                options=entry.options,
            ))
    for discovery_path in sorted((OUT / "discoveries").glob("*.json")) if (OUT / "discoveries").exists() else []:
        discovery = json.loads(discovery_path.read_text(encoding="utf-8"))
        records.extend(BoardRecord.model_validate(item) for item in discovery.get("records", []))
    records, duplicates = merge_records(records)
    OUT.mkdir(exist_ok=True)
    document = RegistryDocument(generated_at=datetime.now(UTC), definition="Company ATS boards with evidence of German hiring. Status dimensions are independent and do not imply unrestricted production reuse.", records=records)
    payload = document.model_dump(mode="json")
    payload["record_count"] = document.record_count
    payload["validation"] = {**validation_summary(document), "duplicates_removed": len(duplicates), "duplicate_details": duplicates}
    (OUT / "german_company_ats_registry.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    flat_records = [item.model_dump(mode="json") | {"ingestion_ready": item.ingestion_ready} for item in records]
    fields = [key for key in flat_records[0] if key != "sample_locations"] + ["sample_locations"]
    with (OUT / "german_company_ats_registry.csv").open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields); writer.writeheader()
        for item in flat_records: writer.writerow({**item, "sample_locations": " | ".join(item["sample_locations"])})
    print(json.dumps({**validation_summary(document), "duplicates_removed": len(duplicates)}, indent=2))


if __name__ == "__main__": main()
