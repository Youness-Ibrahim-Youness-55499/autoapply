from __future__ import annotations

from dataclasses import asdict, dataclass

import pymupdf


@dataclass(frozen=True)
class TextLine:
    page: int
    x0: float
    y0: float
    x1: float
    y1: float
    text: str
    font_size: float
    bold: bool


def extract_lines(pdf_bytes: bytes) -> tuple[list[TextLine], list[float]]:
    document = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    lines: list[TextLine] = []
    page_widths: list[float] = []

    try:
        for page_index, page in enumerate(document):
            page_widths.append(float(page.rect.width))
            page_dict = page.get_text("dict", sort=True)
            for block in page_dict.get("blocks", []):
                if block.get("type") != 0:
                    continue
                for raw_line in block.get("lines", []):
                    spans = raw_line.get("spans", [])
                    text = "".join(str(span.get("text", "")) for span in spans).strip()
                    if not text:
                        continue
                    bbox = raw_line.get("bbox", (0, 0, 0, 0))
                    lines.append(
                        TextLine(
                            page=page_index,
                            x0=float(bbox[0]),
                            y0=float(bbox[1]),
                            x1=float(bbox[2]),
                            y1=float(bbox[3]),
                            text=text,
                            font_size=max((float(span.get("size", 0)) for span in spans), default=0),
                            bold=any("bold" in str(span.get("font", "")).lower() for span in spans),
                        )
                    )
    finally:
        document.close()

    return lines, page_widths


def serializable_lines(lines: list[TextLine]) -> list[dict[str, object]]:
    return [asdict(line) for line in lines]
