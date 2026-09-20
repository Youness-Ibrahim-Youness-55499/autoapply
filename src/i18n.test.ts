import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { messages } from "./i18n";

// Keys that only exist in English today (present before the redesign work).
const KNOWN_ORPHAN_DE_KEYS = ["auth.email.placeholder", "auth.name.placeholder", "auth.password.placeholder"];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !name.endsWith(".test.ts") && name !== "i18n.tsx" ? [path] : [];
  });
}

function placeholders(text: string) {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

describe("translations", () => {
  const enKeys = Object.keys(messages.en);
  const deKeys = new Set(Object.keys(messages.de));

  it("has a German string for every English one", () => {
    expect(enKeys.filter((key) => !deKeys.has(key))).toEqual([]);
  });

  it("has no German keys without an English counterpart (apart from known legacy ones)", () => {
    const stray = [...deKeys].filter((key) => !(key in messages.en) && !KNOWN_ORPHAN_DE_KEYS.includes(key));

    expect(stray).toEqual([]);
  });

  it("uses the same {placeholders} in both languages", () => {
    const mismatched = enKeys.filter(
      (key) => key in messages.de && placeholders(messages.en[key]).join() !== placeholders(messages.de[key]).join(),
    );

    expect(mismatched).toEqual([]);
  });

  it("has no empty strings", () => {
    const empty = enKeys.filter((key) => messages.en[key].trim() === "" || (messages.de[key] ?? "x").trim() === "");

    expect(empty).toEqual([]);
  });

  it("defines every key that the code asks for with a literal t(\"...\")", () => {
    const used = new Set<string>();
    for (const file of sourceFiles(fileURLToPath(new URL(".", import.meta.url)))) {
      const text = readFileSync(file, "utf8");
      for (const match of text.matchAll(/\bt\(\s*"([^"]+)"/g)) used.add(match[1]);
    }

    expect([...used].filter((key) => !(key in messages.en)).sort()).toEqual([]);
  });
});
