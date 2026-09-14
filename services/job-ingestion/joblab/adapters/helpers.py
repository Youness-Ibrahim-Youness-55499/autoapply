from __future__ import annotations

import re
from datetime import datetime
from urllib.parse import urlparse

from bs4 import BeautifulSoup


def text(value) -> str:
    if value is None:
        return ""
    return BeautifulSoup(str(value), "lxml").get_text(" ", strip=True)


def date(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError:
        return None


def domain(url: str | None):
    return urlparse(url).netloc.removeprefix("www.") if url else None


def location_parts(location: str):
    bits = [part.strip() for part in re.split(r"[,|]", location or "") if part.strip()]
    city = bits[0] if bits else None
    country = bits[-1] if len(bits) > 1 else None
    return city, country
