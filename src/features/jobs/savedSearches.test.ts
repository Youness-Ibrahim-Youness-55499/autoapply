import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyJobFilters, SALARY_MAX, SALARY_MIN } from "./jobFilterState";
import {
  MAX_SAVED_SEARCHES,
  createSavedSearch,
  deserializeFilters,
  loadSavedSearches,
  persistSavedSearches,
  savedSearchParts,
  serializeFilters,
} from "./savedSearches";

function installLocalStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    },
  });
  return store;
}

const STORAGE_KEY = "jobman.savedJobSearches";

beforeEach(() => {
  installLocalStorage();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("serializeFilters / deserializeFilters", () => {
  it("round-trips sets and the salary range", () => {
    const filters = createEmptyJobFilters();
    filters.workModes = new Set(["Remote"]);
    filters.skills = new Set(["Python", "SQL"]);
    filters.salaryMin = 50000;

    const restored = deserializeFilters(serializeFilters(filters));

    expect([...restored.workModes]).toEqual(["Remote"]);
    expect([...restored.skills]).toEqual(["Python", "SQL"]);
    expect(restored.salaryMin).toBe(50000);
    expect(restored.salaryMax).toBe(SALARY_MAX);
  });

  it("produces JSON-safe output", () => {
    const serialized = serializeFilters(createEmptyJobFilters());

    expect(JSON.parse(JSON.stringify(serialized))).toEqual(serialized);
  });
});

describe("loadSavedSearches", () => {
  it("returns an empty list when nothing is stored", () => {
    expect(loadSavedSearches()).toEqual([]);
  });

  it("round-trips through persistSavedSearches", () => {
    const search = createSavedSearch("designer", "Berlin, DE", createEmptyJobFilters());
    persistSavedSearches([search]);

    expect(loadSavedSearches()).toEqual([search]);
  });

  it("returns an empty list for corrupt JSON", () => {
    installLocalStorage({ [STORAGE_KEY]: "{not json" });

    expect(loadSavedSearches()).toEqual([]);
  });

  it("returns an empty list when the value is not an array", () => {
    installLocalStorage({ [STORAGE_KEY]: JSON.stringify({ a: 1 }) });

    expect(loadSavedSearches()).toEqual([]);
  });

  it("drops entries with an old or damaged shape instead of crashing", () => {
    const good = createSavedSearch("ok", "", createEmptyJobFilters());
    installLocalStorage({
      [STORAGE_KEY]: JSON.stringify([
        null,
        "text",
        { id: "1", location: "", query: "no filters" },
        { filters: { skills: "not-an-array" }, id: "2", location: "", query: "" },
        good,
      ]),
    });

    expect(loadSavedSearches()).toEqual([good]);
  });

  it("survives storage being unavailable", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
      },
    });

    expect(loadSavedSearches()).toEqual([]);
    expect(() => persistSavedSearches([])).not.toThrow();
  });
});

describe("persistSavedSearches", () => {
  it("keeps at most MAX_SAVED_SEARCHES", () => {
    const many = Array.from({ length: MAX_SAVED_SEARCHES + 3 }, (_, index) => ({
      ...createSavedSearch(`q${index}`, "", createEmptyJobFilters()),
      id: String(index),
    }));
    persistSavedSearches(many);

    expect(loadSavedSearches()).toHaveLength(MAX_SAVED_SEARCHES);
  });
});

describe("savedSearchParts", () => {
  it("lists the words a chip label is built from", () => {
    const filters = createEmptyJobFilters();
    filters.workModes = new Set(["Remote"]);
    filters.skills = new Set(["Python"]);
    const search = createSavedSearch("designer", "Berlin, DE", filters);

    expect(savedSearchParts(search)).toEqual(["designer", "Berlin, DE", "Remote", "Python"]);
  });

  it("is empty for a search that only changes the salary range", () => {
    const filters = createEmptyJobFilters();
    filters.salaryMin = SALARY_MIN + 10000;

    expect(savedSearchParts(createSavedSearch("", "", filters))).toEqual([]);
  });
});
