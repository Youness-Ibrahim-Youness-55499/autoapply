// Shared shape for raw, position-aware text extracted from a source
// document, before any section/field interpretation happens. Both the PDF
// and DOCX parsers produce this same shape so the application layer
// doesn't need to know which parser ran. Not part of the public
// ExtractedCV contract (see ../domain/types.ts) -- this is an internal
// pipeline shape.

export type LayoutTextBlock = {
  blockId: string;
  fontSize: number;
  // Best-effort only. Verified directly against pdfjs-dist: PDFs using
  // standard, non-embedded fonts (very common) only expose a generic CSS
  // fallback family ("sans-serif"/"serif"/"monospace"), not the real font
  // name, so bold/italic frequently can't be determined for those. Treat
  // this as a secondary signal -- font-size jumps relative to body text
  // are the primary, reliable one for section-header detection.
  isBold: boolean;
  isItalic: boolean;
  page: number;
  text: string;
  // Native coordinate space of the source parser (PDF: bottom-left
  // origin, points; DOCX: whatever its own parser documents). Not
  // normalized across formats at this layer.
  x: number;
  y: number;
};
