from __future__ import annotations

import re

GERMAN_CITIES = {
    "aachen", "berlin", "bielefeld", "bochum", "bonn", "bremen", "cologne",
    "koln", "darmstadt", "dortmund", "dresden", "dusseldorf", "erlangen",
    "essen", "frankfurt", "freiburg", "hamburg", "hannover", "heidelberg",
    "ingolstadt", "karlsruhe", "kiel", "leipzig", "mainz", "mannheim",
    "munich", "munchen", "nuremberg", "nurnberg", "potsdam", "regensburg",
    "stuttgart", "ulm", "wiesbaden", "wolfsburg",
}


def _plain(value: str | None) -> str:
    value = (value or "").lower()
    return value.translate(str.maketrans({"ä": "a", "ö": "o", "ü": "u", "ß": "ss"}))


def is_german_job(job) -> bool:
    country = _plain(job.country).strip()
    location = _plain(job.location_text)
    city = _plain(job.city).strip()
    if country in {"de", "deu", "germany", "deutschland"}:
        return True
    if re.search(r"\b(germany|deutschland)\b", location):
        return True
    return city in GERMAN_CITIES or any(re.search(rf"\b{re.escape(name)}\b", location) for name in GERMAN_CITIES)
