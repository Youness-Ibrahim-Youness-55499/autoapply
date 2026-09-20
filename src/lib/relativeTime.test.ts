import { describe, expect, it } from "vitest";
import { formatRelative } from "./relativeTime";

const NOW = new Date("2026-06-30T12:00:00Z");
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatRelative", () => {
  it("uses minutes below an hour", () => {
    expect(formatRelative(new Date(NOW.getTime() + 30 * MINUTE), "en", NOW)).toBe("in 30 minutes");
  });

  it("uses hours below a day", () => {
    expect(formatRelative(new Date(NOW.getTime() - 3 * HOUR), "en", NOW)).toBe("3 hours ago");
  });

  it("uses natural words for tomorrow and yesterday", () => {
    expect(formatRelative(new Date(NOW.getTime() + DAY), "en", NOW)).toBe("tomorrow");
    expect(formatRelative(new Date(NOW.getTime() - DAY), "en", NOW)).toBe("yesterday");
  });

  it("uses days up to a month and months beyond", () => {
    expect(formatRelative(new Date(NOW.getTime() - 5 * DAY), "en", NOW)).toBe("5 days ago");
    expect(formatRelative(new Date(NOW.getTime() + 65 * DAY), "en", NOW)).toBe("in 2 months");
  });

  it("follows the requested locale", () => {
    expect(formatRelative(new Date(NOW.getTime() + DAY), "de", NOW)).toBe("morgen");
    expect(formatRelative(new Date(NOW.getTime() - 5 * DAY), "de", NOW)).toBe("vor 5 Tagen");
  });
});
