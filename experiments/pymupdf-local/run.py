"""Isolated, deterministic PyMuPDF extraction test for CV PDFs."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pymupdf


SECTION_ALIASES = {
    "experience": ("experience",),
    "education": ("education",),
    "skills": ("skills",),
    "languages": ("languages",),
    "certificates": ("certificates", "certifications", "certifiactes"),
}


def normalize(value: str) -> str:
    return re.sub(r"[^a-z]+", " ", value.lower()).strip()


def extract_document(input_path: Path, output_root: Path) -> dict[str, object]:
    document = pymupdf.open(input_path)
    target = output_root / input_path.stem
    target.mkdir(parents=True, exist_ok=True)

    page_texts: list[str] = []
    blocks: list[dict[str, object]] = []

    for page_number, page in enumerate(document, start=1):
        page_texts.append(page.get_text("text", sort=True))
        page_data = page.get_text("dict", sort=True)
        page.get_pixmap(dpi=120, alpha=False).save(target / f"page-{page_number}.png")

        for block in page_data.get("blocks", []):
            if block.get("type") != 0:
                continue

            lines: list[str] = []
            sizes: list[float] = []
            fonts: list[str] = []
            for line in block.get("lines", []):
                line_text = "".join(span.get("text", "") for span in line.get("spans", []))
                if line_text.strip():
                    lines.append(line_text)
                for span in line.get("spans", []):
                    sizes.append(float(span.get("size", 0)))
                    fonts.append(str(span.get("font", "")))

            text = "\n".join(lines).strip()
            if not text:
                continue

            blocks.append(
                {
                    "page": page_number,
                    "bbox": [round(float(value), 2) for value in block.get("bbox", [])],
                    "text": text,
                    "max_font_size": round(max(sizes, default=0), 2),
                    "bold": any("bold" in font.lower() for font in fonts),
                }
            )

    extracted_text = "\n\n".join(page_texts).strip() + "\n"
    normalized_text = normalize(extracted_text)
    detected_sections = {
        section: any(
            re.search(rf"\b{re.escape(alias)}\b", normalized_text)
            for alias in aliases
        )
        for section, aliases in SECTION_ALIASES.items()
    }

    report: dict[str, object] = {
        "engine": f"PyMuPDF {pymupdf.__version__}",
        "pages": document.page_count,
        "characters": len(extracted_text),
        "words": len(re.findall(r"\b\w+\b", extracted_text)),
        "text_blocks": len(blocks),
        "sections_detected": detected_sections,
        "ocr_used": False,
    }

    (target / "extracted.txt").write_text(extracted_text, encoding="utf-8")
    (target / "blocks.json").write_text(
        json.dumps(blocks, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (target / "report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    document.close()
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Path to a PDF CV")
    parser.add_argument("--output", type=Path, required=True, help="Output directory")
    args = parser.parse_args()

    input_path = args.input.resolve(strict=True)
    if input_path.suffix.lower() != ".pdf":
        raise ValueError("This experiment accepts PDF files only.")

    report = extract_document(input_path, args.output.resolve())
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
