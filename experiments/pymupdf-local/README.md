# PyMuPDF local evaluation

This experiment tests deterministic PDF text and layout extraction with PyMuPDF. It is isolated from Jobman, Supabase, and the MinerU experiment. It does not call an LLM or consume model tokens.

## Setup

Create a dedicated virtual environment and install the pinned dependency:

```powershell
python -m venv .pymupdf-venv
.\.pymupdf-venv\Scripts\python.exe -m pip install -r ".\experiments\pymupdf-local\requirements.txt"
```

## Run

From the repository root:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\experiments\pymupdf-local\run.ps1" -InputFile "C:\path\to\sample-cv.pdf"
```

Generated files are written to `experiments/pymupdf-local/output/` and ignored by Git:

- `extracted.txt`: native PDF text in layout-sorted order;
- `blocks.json`: text, bounding boxes, page numbers, and basic font metadata;
- `report.json`: non-sensitive extraction metrics and section-presence checks.
- `page-*.png`: low-resolution page renders for visual layout verification.

This first pass deliberately does not use OCR. PyMuPDF's native extraction is the appropriate path for a digital PDF with selectable text. OCR should only be added as a fallback when a page contains little or no native text.
