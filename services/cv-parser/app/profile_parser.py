from __future__ import annotations

import re
from uuid import uuid4

from .extractor import TextLine
from .schemas import EducationEntry, ExperienceEntry, LanguageEntry, ParsedProfile


SECTION_ALIASES = {
    "certificates": {"certificates", "certifications", "certifiactes"},
    "education": {"education"},
    "experience": {"experience", "work experience", "working experience", "employment"},
    "skills": {"skills", "technical skills", "core skills"},
    "languages": {"languages", "language skills"},
}
DATE_RANGE = re.compile(
    r"(?P<start>(?:[A-Za-z]{3,9}\s+)?\d{4})\s*[-–—]\s*"
    r"(?P<end>present|current|(?:[A-Za-z]{3,9}\s+)?\d{4})",
    re.IGNORECASE,
)
BULLET_PREFIX = re.compile(r"^[\s•·▪◦*\-�]+")


def normalized(value: str) -> str:
    return re.sub(r"[^a-z]+", " ", value.lower()).strip()


def section_name(text: str) -> str | None:
    value = normalized(text)
    for name, aliases in SECTION_ALIASES.items():
        if value in aliases:
            return name
    return None


def section_lines(lines: list[TextLine], target: str) -> list[TextLine]:
    ordered = sorted(lines, key=lambda line: (line.page, line.y0, line.x0))
    start_index: int | None = None
    for index, line in enumerate(ordered):
        name = section_name(line.text)
        if name == target:
            start_index = index + 1
            break
    if start_index is None:
        return []

    selected: list[TextLine] = []
    for line in ordered[start_index:]:
        if section_name(line.text):
            break
        selected.append(line)
    return selected


def split_date_range(value: str) -> tuple[str, str, bool]:
    match = DATE_RANGE.search(value)
    if not match:
        return "", "", False
    start = match.group("start").strip()
    end = match.group("end").strip()
    current = end.lower() in {"present", "current"}
    return start, "" if current else end, current


def join_wrapped_lines(values: list[str]) -> str:
    combined = ""
    for value in values:
        text = value.strip()
        if not text:
            continue
        if combined.endswith("-"):
            combined = combined[:-1] + text
        elif combined:
            combined += " " + text
        else:
            combined = text
    return combined


def heading_and_body(details: list[TextLine]) -> tuple[str, list[TextLine]]:
    heading_lines: list[str] = []
    body_index = len(details)
    for index, line in enumerate(details):
        if re.match(r"^[•·▪◦*\-�]", line.text.strip()):
            body_index = index
            break
        heading_lines.append(line.text)
    return join_wrapped_lines(heading_lines), details[body_index:]


def parse_skills(lines: list[TextLine]) -> list[str]:
    values: list[str] = []
    for line in section_lines(lines, "skills"):
        has_bullet = bool(re.match(r"^[•·▪◦*\-�]", line.text.strip()))
        if not has_bullet and "," not in line.text:
            continue
        value = BULLET_PREFIX.sub("", line.text).strip()
        if not value:
            continue
        for skill in (part.strip() for part in value.split(",")):
            if skill and skill.casefold() not in {item.casefold() for item in values}:
                values.append(skill)
    return values[:100]


def parse_languages(lines: list[TextLine]) -> list[LanguageEntry]:
    entries: list[LanguageEntry] = []
    rows: list[list[TextLine]] = []
    for line in section_lines(lines, "languages"):
        row = next((item for item in rows if item[0].page == line.page and abs(item[0].y0 - line.y0) < 3), None)
        if row is None:
            rows.append([line])
        else:
            row.append(line)

    for row in rows:
        value = BULLET_PREFIX.sub("", " ".join(line.text for line in sorted(row, key=lambda item: item.x0))).strip(" .")
        level_match = re.search(r"\b(A1|A2|B1|B2|C1|C2|Native)\b", value, re.IGNORECASE)
        if not level_match:
            continue
        name = re.split(r"\s*[-–—:]\s*", value, maxsplit=1)[0].strip()
        if not name or len(name.split()) > 3:
            continue
        raw_level = level_match.group(1)
        level = "Native" if raw_level.lower() == "native" else raw_level.upper()
        entries.append(LanguageEntry(id=str(uuid4()), name=name, level=level))
    return entries


def pair_rows(lines: list[TextLine], page_widths: list[float], target: str) -> list[tuple[TextLine, list[TextLine]]]:
    selected = section_lines(lines, target)
    date_lines = [line for line in selected if DATE_RANGE.search(line.text)]
    rows: list[tuple[TextLine, list[TextLine]]] = []

    for index, date_line in enumerate(date_lines):
        next_date = date_lines[index + 1] if index + 1 < len(date_lines) else None
        page_width = page_widths[date_line.page]
        details = [
            line
            for line in selected
            if line.page == date_line.page
            and line.x0 >= page_width * 0.25
            and line.y0 >= date_line.y0 - 4
            and (next_date is None or next_date.page != line.page or line.y0 < next_date.y0 - 4)
            and line is not date_line
        ]
        if details:
            rows.append((date_line, details))
    return rows


def parse_education(lines: list[TextLine], page_widths: list[float]) -> list[EducationEntry]:
    entries: list[EducationEntry] = []
    for date_line, details in pair_rows(lines, page_widths, "education"):
        heading, _ = heading_and_body(details)
        parts = [part.strip(" .") for part in heading.split(",") if part.strip(" .")]
        if len(parts) < 2:
            continue
        start, end, _ = split_date_range(date_line.text)
        entries.append(
            EducationEntry(
                id=str(uuid4()),
                degree=parts[0],
                institution=", ".join(parts[1:]),
                startDate=start,
                endDate=end,
            )
        )
    return entries


def parse_experience(lines: list[TextLine], page_widths: list[float]) -> list[ExperienceEntry]:
    entries: list[ExperienceEntry] = []
    for date_line, details in pair_rows(lines, page_widths, "experience"):
        heading, body = heading_and_body(details)
        parts = [part.strip(" .") for part in heading.split(",") if part.strip(" .")]
        if len(parts) < 2:
            continue
        start, end, current = split_date_range(date_line.text)
        description = "\n".join(
            BULLET_PREFIX.sub("", line.text).strip() for line in body if line.text.strip()
        )
        entries.append(
            ExperienceEntry(
                id=str(uuid4()),
                role=parts[0],
                company=parts[1],
                location=", ".join(parts[2:]),
                startDate=start,
                endDate=end,
                current=current,
                description=description,
            )
        )
    return entries


def parse_profile(lines: list[TextLine], page_widths: list[float]) -> ParsedProfile:
    first_page = [line for line in lines if line.page == 0]
    name = max(first_page, key=lambda line: line.font_size, default=None)
    location_line = next(
        (line for line in first_page if re.search(r"\b[A-Z0-9]{4,6}\b", line.text) and "," in line.text),
        None,
    )

    return ParsedProfile(
        full_name=name.text if name else "",
        location=location_line.text if location_line else "",
        skills=parse_skills(lines),
        education=parse_education(lines, page_widths),
        experience=parse_experience(lines, page_widths),
        languages=parse_languages(lines),
    )
