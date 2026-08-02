// Orchestrates the full extraction pipeline: layout-aware blocks (from
// either pdfParser.ts or docxParser.ts, format-agnostic from here on) ->
// section detection -> per-section field extraction -> the final
// ExtractedCV contract. Pure and parser-agnostic: no I/O of its own.

import type { LayoutTextBlock } from "../infrastructure/layout.ts";
import type { ExtractedCV } from "../domain/types.ts";
import { computeNeedsReview } from "../domain/rules.ts";
import { detectSections } from "./sectionDetector.ts";
import { extractContact } from "./contactExtractor.ts";
import { extractEducation } from "./educationExtractor.ts";
import { extractExperience } from "./experienceExtractor.ts";
import { extractSkills } from "./skillExtractor.ts";

export function extractCv(blocks: LayoutTextBlock[]): ExtractedCV {
  const { preamble, sections, unmatched } = detectSections(blocks);

  const contactSection = sections.find((section) => section.key === "contact");
  // Contact info commonly sits in the top-of-page preamble (name/title/
  // contact line) rather than under its own header -- scan both so it's
  // found either way, instead of requiring a dedicated "Contact" section.
  const contactBlocks = contactSection ? [...preamble, ...contactSection.blocks] : preamble;
  const contact = extractContact(contactBlocks);

  const experienceSection = sections.find((section) => section.key === "experience");
  const experience = experienceSection ? extractExperience(experienceSection.blocks) : [];

  const educationSection = sections.find((section) => section.key === "education");
  const education = educationSection ? extractEducation(educationSection.blocks) : [];

  const skillsSection = sections.find((section) => section.key === "skills");
  const skills = skillsSection ? extractSkills(skillsSection.blocks) : [];

  const unmatchedSections = unmatched.map((candidate) => ({
    header: candidate.headerBlock.text,
    rawText: candidate.blocks.map((block) => block.text).join("\n"),
  }));

  const cv: ExtractedCV = {
    contact,
    education,
    experience,
    needsReview: false,
    skills,
    unmatchedSections,
  };

  cv.needsReview = computeNeedsReview(cv);

  return cv;
}
