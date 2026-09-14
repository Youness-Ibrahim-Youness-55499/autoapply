from datetime import datetime
from pathlib import Path
import asyncio
import json

import httpx
import pytest

from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker

from joblab.adapters.generic import GenericAdapter, jsonld_from_html, raw_from_jsonld
from joblab.adapters.ashby import AshbyAdapter
from joblab.adapters.greenhouse import GreenhouseAdapter
from joblab.adapters.lever import LeverAdapter
from joblab.adapters.personio import PersonioAdapter
from joblab.adapters.workday import WorkdayAdapter, workday_config
from joblab.adapters.successfactors import SuccessFactorsAdapter, parse_legacy_listing
from joblab.board_catalog import BoardInput, api_url, board_url, load_board_catalog, source_config
from joblab.dedupe import fingerprint, secondary_title_match
from joblab.ingestion import save_raw_job
from joblab.location_filter import is_german_job
from joblab.models import Base, Company, Job, JobSource, Source
from joblab.normalization import normalize_domain, normalize_text
from joblab.schemas import RawJob
from joblab.registry import AdapterStatus, BoardRecord, EndpointStatus, GermanyStatus, QueryStatus, merge_records
from joblab.verification import VerificationProgress

FIXTURES = Path(__file__).parent / "fixtures"


def raw(source_id="one", source_name="fixture:a"):
    return RawJob(source_name=source_name, source_type="fixture", source_job_id=source_id, source_url=f"https://example.com/{source_id}", company_name="Example GmbH", company_domain="example.com", title="Senior Software Engineer", location_text="Munich, Germany", city="Munich", country="DE", description="Build systems")


def database():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, expire_on_commit=False)()


def test_normalization_and_fingerprint():
    assert normalize_text(" München / C++ ") == "munchen-c"
    assert normalize_domain("https://www.Example.com/jobs") == "example.com"
    assert fingerprint(raw()) == fingerprint(raw("different"))
    assert secondary_title_match("Senior Software Engineer", "Senior Software Engineer (m/f/d)", threshold=.75)


def test_germany_filter_accepts_country_and_german_city_only():
    assert is_german_job(raw().model_copy(update={"country": "DE"}))
    assert is_german_job(raw().model_copy(update={"country": None, "location_text": "München"}))
    assert not is_german_job(raw().model_copy(update={"country": "FR", "location_text": "Paris, France", "city": "Paris"}))


def test_jsonld_fixture_parsing():
    html = (FIXTURES / "jsonld.html").read_text()
    objects = jsonld_from_html(html)
    result = raw_from_jsonld(objects[0], {"company": "Example GmbH", "url": "https://example.com/careers"}, "https://example.com/careers")
    assert result.title == "Software Engineer"
    assert result.city == "Munich"
    assert result.country == "DE"


def test_idempotency_and_multi_source_linking():
    db = database()
    first = Source(key="fixture:a", company_name="Example GmbH", source_type="fixture", provider="fixture")
    second = Source(key="fixture:b", company_name="Example GmbH", source_type="fixture", provider="fixture")
    db.add_all([first, second]); db.flush()
    seen = datetime.utcnow()
    assert save_raw_job(db, first, raw("a-1", "fixture:a"), seen)
    assert not save_raw_job(db, first, raw("a-1", "fixture:a"), seen)
    assert not save_raw_job(db, second, raw("b-9", "fixture:b"), seen)
    db.commit()
    assert db.scalar(select(func.count(Job.id))) == 1
    assert db.scalar(select(func.count(JobSource.id))) == 2
    assert db.scalar(select(func.count(Company.id))) == 1


def test_saved_ats_fixtures_are_valid():
    greenhouse = json.loads((FIXTURES / "greenhouse.json").read_text())
    lever = json.loads((FIXTURES / "lever.json").read_text())
    assert greenhouse["jobs"][0]["id"] == 101
    assert lever[0]["country"] == "DE"


class FixtureFetcher:
    def __init__(self, body: str, content_type="application/json"):
        self.body = body
        self.content_type = content_type

    async def get(self, url, **_kwargs):
        request = httpx.Request("GET", url)
        return httpx.Response(200, text=self.body, headers={"content-type": self.content_type}, request=request)


class WorkdayFixtureFetcher:
    def __init__(self):
        self.offsets = []

    async def post(self, url, json, **_kwargs):
        self.offsets.append(json["offset"])
        start = json["offset"]
        postings = [{"title": f"Role {index}", "externalPath": f"/job/role-{index}", "locationsText": "Berlin, Germany"} for index in range(start, min(start + 2, 3))]
        return httpx.Response(200, json={"total": 3, "jobPostings": postings}, request=httpx.Request("POST", url))

    async def get(self, url, **_kwargs):
        index = url.rsplit("-", 1)[-1]
        return httpx.Response(200, json={"jobPostingInfo": {"jobReqId": f"REQ-{index}", "title": f"Role {index}", "location": "Berlin, Germany", "timeType": "Full time", "jobDescription": "<p>Build products.</p>"}}, request=httpx.Request("GET", url))


class SuccessFactorsFixtureFetcher:
    def __init__(self):
        self.pages = []

    async def post(self, url, json, **_kwargs):
        page = json["pageNumber"]
        self.pages.append(page)
        start = page * 2
        results = [{"response": {"id": str(index), "unifiedStandardTitle": f"Role {index}", "jobLocationShort": ["Berlin, BE, DEU"], "filter2": ["Engineering"]}} for index in range(start, min(start + 2, 3))]
        return httpx.Response(200, json={"totalJobs": 3, "jobSearchResult": results}, request=httpx.Request("POST", url))

    async def get(self, url, **_kwargs):
        return httpx.Response(200, text='<div class="jobDisplay"><p>Build trusted systems.</p></div>', request=httpx.Request("GET", url))


def test_greenhouse_fixture_adapter():
    adapter = GreenhouseAdapter({"company": "Example GmbH", "identifier": "example", "company_domain": "example.com"}, FixtureFetcher((FIXTURES / "greenhouse.json").read_text()))
    rows = asyncio.run(adapter.fetch())
    assert rows[0].source_job_id == "101"
    assert rows[0].title == "Software Engineer"


def test_ashby_fixture_adapter_and_germany_filter():
    adapter = AshbyAdapter({"company": "Example GmbH", "identifier": "example", "company_domain": "example.com"}, FixtureFetcher((FIXTURES / "ashby.json").read_text()))
    rows = asyncio.run(adapter.fetch())
    assert len(rows) == 2
    german = [row for row in rows if is_german_job(row)]
    assert len(german) == 1
    assert german[0].city == "Berlin"
    assert german[0].employment_type == "FullTime"


def test_lever_fixture_adapter():
    adapter = LeverAdapter({"company": "Example GmbH", "identifier": "example", "company_domain": "example.com"}, FixtureFetcher((FIXTURES / "lever.json").read_text()))
    rows = asyncio.run(adapter.fetch())
    assert rows[0].country == "DE"
    assert rows[0].employment_type == "Full-time"


def test_personio_xml_fixture_adapter():
    adapter = PersonioAdapter({"company": "Example GmbH", "identifier": "example", "country": "DE"}, FixtureFetcher((FIXTURES / "personio.xml").read_text(), "application/xml"))
    rows = asyncio.run(adapter.fetch())
    assert len(rows) == 2
    assert rows[0].source_job_id == "1001"
    assert rows[0].city == "Berlin"
    assert rows[0].employment_type == "permanent / full-time"
    assert "Build reliable products" in rows[0].description
    assert is_german_job(rows[0])


def test_workday_cxs_pagination_and_parsing():
    fetcher = WorkdayFixtureFetcher()
    config = {"company": "Example GmbH", "provider": "workday", "identifier": "example|Careers", "url": "https://example.wd3.myworkdayjobs.com/Careers", "page_size": 2}
    board_url, cxs = workday_config(config)
    assert cxs == "https://example.wd3.myworkdayjobs.com/wday/cxs/example/Careers"
    rows = asyncio.run(WorkdayAdapter(config, fetcher).fetch())
    assert fetcher.offsets == [0, 2]
    assert len(rows) == 3
    assert rows[0].source_job_id == "REQ-0"
    assert rows[0].description == "Build products."
    assert is_german_job(rows[0])


def test_successfactors_csb_pagination_and_parsing():
    fetcher = SuccessFactorsFixtureFetcher()
    config = {"company": "Example GmbH", "provider": "successfactors", "identifier": "example", "url": "https://example.jobs.hr.cloud.sap", "mode": "csb"}
    rows = asyncio.run(SuccessFactorsAdapter(config, fetcher).fetch())
    assert fetcher.pages == [0, 1]
    assert len(rows) == 3
    assert rows[0].source_job_id == "0"
    assert rows[0].description == "Build trusted systems."
    assert is_german_job(rows[0])


def test_successfactors_legacy_configurable_parser():
    html = '<table><tr><td><a href="/career?company=example&amp;career_job_req_id=42">Engineer</a></td><td class="location">Munich, Germany</td></tr></table>'
    rows = parse_legacy_listing(html, {"company": "Example GmbH", "identifier": "example", "url": "https://career5.successfactors.eu/career"})
    assert rows[0].source_job_id == "42"
    assert rows[0].city == "Munich"
    assert is_german_job(rows[0])


def test_board_catalog_builds_provider_endpoints():
    lever = BoardInput(company="Example", provider="lever", identifier="example", region="eu")
    assert board_url(lever) == "https://jobs.eu.lever.co/example"
    assert api_url(lever) == "https://api.eu.lever.co/v0/postings/example?mode=json"
    assert source_config(lever)["provider"] == "lever"

    workday = BoardInput(company="Example", provider="workday", identifier="tenant|site", board_url="https://tenant.wd3.myworkdayjobs.com/site")
    assert api_url(workday) == "https://tenant.wd3.myworkdayjobs.com/wday/cxs/tenant/site/jobs"


def test_board_catalog_requires_tenant_specific_configuration():
    with pytest.raises(ValueError, match=r"tenant\|career_site"):
        BoardInput(company="Example", provider="workday", identifier="tenant", board_url="https://example.com")
    with pytest.raises(ValueError, match="requires board_url"):
        BoardInput(company="Example", provider="successfactors", identifier="example")


def test_compact_catalog_loads_working_and_future_providers(tmp_path):
    catalog = tmp_path / "boards.csv"
    catalog.write_text(
        "company,provider,identifier,board_url,region,company_domain,enabled,options\n"
        "Example,lever,example,,eu,example.com,true,{}\n"
        "Future,onlyfy,future,https://future.example/jobs,global,,false,{}\n",
        encoding="utf-8",
    )
    rows = load_board_catalog(catalog)
    assert len(rows) == 2
    assert rows[0].enabled
    assert not rows[1].enabled


def test_compact_catalog_allows_unresolved_disabled_board(tmp_path):
    catalog = tmp_path / "boards.csv"
    catalog.write_text(
        "company,provider,identifier,board_url,region,company_domain,enabled,options\n"
        "Future,onlyfy,,https://future.example/jobs,global,,false,{}\n",
        encoding="utf-8",
    )
    assert load_board_catalog(catalog)[0].identifier == ""


def test_generic_selector_fixture_adapter():
    config = {"company": "Example GmbH", "url": "https://example.com/careers", "selectors": {"job_card": ".vacancy", "title": ".title", "location": ".location", "description": ".description", "link": "a"}}
    adapter = GenericAdapter(config, FixtureFetcher((FIXTURES / "generic.html").read_text(), "text/html"))
    rows = asyncio.run(adapter.fetch())
    assert rows[0].title
    assert rows[0].company_name == "Example GmbH"


def test_registry_schema_and_deterministic_deduplication():
    values = dict(company_name="Example GmbH", ats_provider="Ashby", board_identifier="example", board_url="https://jobs.ashbyhq.com/example", api_url="https://api.ashbyhq.com/posting-api/job-board/example", endpoint_status=EndpointStatus.IDENTIFIED, query_status=QueryStatus.QUERYABLE, germany_status=GermanyStatus.VERIFIED, adapter_status=AdapterStatus.WORKING, germany_evidence="Berlin job verified")
    first = BoardRecord(**values)
    second = BoardRecord(**values)
    merged, duplicates = merge_records([first, second])
    assert first.record_id == second.record_id
    assert first.ingestion_ready
    assert len(merged) == 1
    assert len(duplicates) == 1


def test_verification_progress_reporting():
    progress = VerificationProgress(provider="ashby", total=3)
    progress.record("verified"); progress.record("failed"); progress.record("skipped")
    assert progress.checked == 3
    assert "1 verified" in progress.line()
