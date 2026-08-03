// Regex-only contact info extraction: email, phone, links. Per the
// spec, these get "high confidence by default" since a regex match on a
// well-formed email/URL is unambiguous -- there's no fuzzy tier here.

import type { LayoutTextBlock } from "../infrastructure/layout.ts";
import type { ExtractedField } from "../domain/types.ts";
import { field } from "./extractedField.ts";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
// Deliberately permissive (7+ digits, common separators) rather than a
// strict per-country format -- a CV's phone number can be in any national
// format. Requiring at least 7 digits keeps it from matching short
// unrelated numbers like a street address or a lone year.
const PHONE_REGEX = /\+?\(?\d[\d\s().-]{5,}\d/;
const URL_REGEX = /(https?:\/\/[^\s,;]+)|(\b(?:www\.)?[a-zA-Z0-9-]+\.(?:com|net|org|io|dev|de|co)\/[^\s,;]*)/i;

function digitCount(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

export function extractContact(blocks: LayoutTextBlock[]): {
  email: ExtractedField<string> | null;
  links: ExtractedField<string>[];
  phone: ExtractedField<string> | null;
} {
  let email: ExtractedField<string> | null = null;
  let phone: ExtractedField<string> | null = null;
  const links: ExtractedField<string>[] = [];
  const seenLinks = new Set<string>();

  for (const block of blocks) {
    if (!email) {
      const emailMatch = EMAIL_REGEX.exec(block.text);
      if (emailMatch) {
        email = field(emailMatch[0], block, "regex-exact");
      }
    }

    if (!phone) {
      const phoneMatch = PHONE_REGEX.exec(block.text);
      if (phoneMatch && digitCount(phoneMatch[0]) >= 7) {
        phone = field(phoneMatch[0].trim(), block, "regex-exact");
      }
    }

    const urlMatch = URL_REGEX.exec(block.text);
    if (urlMatch) {
      const value = urlMatch[0];
      if (!seenLinks.has(value)) {
        seenLinks.add(value);
        links.push(field(value, block, "regex-exact"));
      }
    }
  }

  return { email, links, phone };
}
