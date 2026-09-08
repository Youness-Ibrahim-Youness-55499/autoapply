# PyMuPDF local evaluation results

## Test configuration

- PyMuPDF 1.28.2
- Two-page English PDF CV
- Native text and positioned-block extraction with layout sorting
- No OCR and no LLM

## Outcome

PyMuPDF completed the local extraction successfully. It returned 396 words in 25 positioned text blocks and detected all expected high-level CV sections, including experience, education, skills, languages, and certificates. The source's misspelled certificate heading is handled through an explicit alias.

Unlike the tested MinerU modes, PyMuPDF retained the skills and languages content in its normal output. It did not silently classify these blocks as page headers or discard them. The generated block JSON also preserves page numbers, bounding boxes, maximum font sizes, and a basic bold-font signal for deterministic downstream parsing.

## Interpretation

For this digitally generated CV, native PyMuPDF extraction is a better document-reading foundation than the tested MinerU configurations. It is lightweight, fast, requires no OCR, and consumes no model tokens.

This is not yet a complete CV parser. The next layer should deterministically identify columns and section boundaries, then map blocks into Jobman's profile schema using heading aliases, coordinates, regular expressions, and validation rules. OCR should remain a fallback for pages with little or no selectable text.
