import argparse
import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from joblab.config import Settings
from joblab.fetching import PoliteFetcher
from joblab.inspector import inspect_url


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("url")
    args = parser.parse_args()
    settings = Settings(); fetcher = PoliteFetcher(settings.user_agent, settings.per_domain_delay)
    try:
        result = await inspect_url(args.url, fetcher)
        print(json.dumps(result, indent=2))
        print("\nRecommended configuration:")
        if result["detected_provider"] != "generic": print(f"provider: {result['detected_provider']}\nidentifier: <verify from detected URL>")
        else: print("source_type: generic\nparser: jsonld" if result["jobposting_count"] else "source_type: generic\nselectors: <required if link discovery fails>")
    finally: await fetcher.close()


if __name__ == "__main__": asyncio.run(main())
