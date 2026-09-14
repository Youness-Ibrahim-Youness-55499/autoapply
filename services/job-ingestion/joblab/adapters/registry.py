from .ashby import AshbyAdapter
from .generic import GenericAdapter
from .greenhouse import GreenhouseAdapter
from .lever import LeverAdapter
from .personio import PersonioAdapter
from .successfactors import SuccessFactorsAdapter
from .smartrecruiters import SmartRecruitersAdapter
from .workday import WorkdayAdapter

ADAPTERS = {"ashby": AshbyAdapter, "greenhouse": GreenhouseAdapter, "lever": LeverAdapter, "personio": PersonioAdapter, "smartrecruiters": SmartRecruitersAdapter, "successfactors": SuccessFactorsAdapter, "workday": WorkdayAdapter}


def adapter_for(config, fetcher):
    if config["source_type"] == "generic":
        return GenericAdapter(config, fetcher)
    provider = config.get("provider", "").lower()
    if provider not in ADAPTERS:
        raise ValueError(f"Unsupported provider: {provider}")
    return ADAPTERS[provider](config, fetcher)
