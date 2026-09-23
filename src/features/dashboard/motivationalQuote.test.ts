import { describe, expect, it } from "vitest";
import { pickQuoteIndex } from "./motivationalQuote";

describe("pickQuoteIndex", () => {
  it("is deterministic for the same seed", () => {
    expect(pickQuoteIndex("2026-09-20T10:00:00Z", 8)).toBe(pickQuoteIndex("2026-09-20T10:00:00Z", 8));
  });

  it("always stays within range", () => {
    for (let index = 0; index < 50; index += 1) {
      const result = pickQuoteIndex(`seed-${index}`, 8);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(8);
    }
  });

  it("varies across different seeds", () => {
    const seen = new Set(Array.from({ length: 20 }, (_, index) => pickQuoteIndex(`login-${index}`, 8)));
    expect(seen.size).toBeGreaterThan(1);
  });

  it("returns 0 for an empty or zero count", () => {
    expect(pickQuoteIndex("anything", 0)).toBe(0);
    expect(pickQuoteIndex("", 8)).toBeGreaterThanOrEqual(0);
  });
});
