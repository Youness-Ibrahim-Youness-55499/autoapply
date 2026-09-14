from __future__ import annotations

import asyncio
import logging
import time
from collections import defaultdict
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


class FetchBlocked(RuntimeError):
    pass


class PoliteFetcher:
    def __init__(self, user_agent: str, delay: float = 1.0):
        self.user_agent = user_agent
        self.delay = delay
        self.last_request: dict[str, float] = defaultdict(float)
        self.robots: dict[str, RobotFileParser] = {}
        self.client = httpx.AsyncClient(headers={"User-Agent": user_agent, "Accept": "application/json,text/html;q=0.9,*/*;q=0.8"}, follow_redirects=True, timeout=20)

    async def close(self):
        await self.client.aclose()

    async def _wait(self, url: str):
        domain = urlparse(url).netloc
        remaining = self.delay - (time.monotonic() - self.last_request[domain])
        if remaining > 0:
            await asyncio.sleep(remaining)
        self.last_request[domain] = time.monotonic()

    async def allowed(self, url: str) -> bool:
        parsed = urlparse(url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        if origin not in self.robots:
            parser = RobotFileParser()
            parser.set_url(f"{origin}/robots.txt")
            try:
                await self._wait(parser.url)
                response = await self.client.get(parser.url)
                if response.status_code == 200:
                    parser.parse(response.text.splitlines())
                else:
                    parser.parse([])
            except httpx.HTTPError:
                parser.parse([])
            self.robots[origin] = parser
        return self.robots[origin].can_fetch(self.user_agent, url)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8), retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError)))
    async def get(self, url: str, *, respect_robots: bool = True) -> httpx.Response:
        if respect_robots and not await self.allowed(url):
            raise FetchBlocked(f"robots.txt disallows {url}")
        await self._wait(url)
        response = await self.client.get(url)
        if response.status_code in {401, 403, 429}:
            retry_after = response.headers.get("Retry-After")
            if retry_after and retry_after.isdigit():
                await asyncio.sleep(min(int(retry_after), 30))
            raise FetchBlocked(f"HTTP {response.status_code}; source skipped")
        response.raise_for_status()
        return response

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8), retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError)))
    async def post(self, url: str, *, json: dict, respect_robots: bool = True) -> httpx.Response:
        if respect_robots and not await self.allowed(url):
            raise FetchBlocked(f"robots.txt disallows {url}")
        await self._wait(url)
        response = await self.client.post(url, json=json)
        if response.status_code in {401, 403, 429}:
            raise FetchBlocked(f"HTTP {response.status_code}; source skipped")
        response.raise_for_status()
        return response
