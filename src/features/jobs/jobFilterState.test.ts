import { describe, expect, it } from "vitest";
import {
  SALARY_MAX,
  SALARY_MIN,
  createEmptyJobFilters,
  hasActiveJobFilters,
  jobMatchesFilters,
  toggleInSet,
} from "./jobFilterState";
import { mockJobs, type MockJob } from "./mockJobs";

const job = {
  companySize: "51-200",
  experienceLevel: "Mid",
  industry: "Software",
  jobType: "Full-time",
  location: "Berlin, DE",
  salaryMax: 80000,
  salaryMin: 60000,
  tags: ["Python", "SQL"],
  workMode: "Hybrid",
} as MockJob;

describe("jobMatchesFilters", () => {
  it("matches everything with empty filters", () => {
    expect(jobMatchesFilters(job, createEmptyJobFilters())).toBe(true);
  });

  it("filters by a selected work mode", () => {
    const filters = createEmptyJobFilters();
    filters.workModes = new Set(["Remote"]);
    expect(jobMatchesFilters(job, filters)).toBe(false);

    filters.workModes = new Set(["Remote", "Hybrid"]);
    expect(jobMatchesFilters(job, filters)).toBe(true);
  });

  it("matches a skill filter when any selected skill is a tag", () => {
    const filters = createEmptyJobFilters();
    filters.skills = new Set(["Go", "SQL"]);
    expect(jobMatchesFilters(job, filters)).toBe(true);

    filters.skills = new Set(["Go"]);
    expect(jobMatchesFilters(job, filters)).toBe(false);
  });

  it("requires the salary range to overlap the job's range", () => {
    let filters = createEmptyJobFilters();
    filters.salaryMin = 90000;
    expect(jobMatchesFilters(job, filters)).toBe(false);

    filters = { ...createEmptyJobFilters(), salaryMax: 50000 };
    expect(jobMatchesFilters(job, filters)).toBe(false);

    filters = { ...createEmptyJobFilters(), salaryMax: 65000, salaryMin: 55000 };
    expect(jobMatchesFilters(job, filters)).toBe(true);
  });

  it("treats the top of the salary slider as no upper limit", () => {
    const rich = { ...job, salaryMax: 300000, salaryMin: 250000 } as MockJob;

    expect(jobMatchesFilters(rich, createEmptyJobFilters())).toBe(true);
    expect(jobMatchesFilters(rich, { ...createEmptyJobFilters(), salaryMax: SALARY_MAX - 5000 })).toBe(false);
  });
});

describe("hasActiveJobFilters", () => {
  it("is false for the empty state and true after any change", () => {
    expect(hasActiveJobFilters(createEmptyJobFilters())).toBe(false);
    expect(hasActiveJobFilters({ ...createEmptyJobFilters(), salaryMin: SALARY_MIN + 5000 })).toBe(true);
    expect(hasActiveJobFilters({ ...createEmptyJobFilters(), skills: new Set(["Python"]) })).toBe(true);
  });
});

describe("toggleInSet", () => {
  it("adds and removes without mutating the original", () => {
    const original = new Set(["a"]);
    const added = toggleInSet(original, "b");
    const removed = toggleInSet(added, "a");

    expect([...original]).toEqual(["a"]);
    expect([...added]).toEqual(["a", "b"]);
    expect([...removed]).toEqual(["b"]);
  });
});

describe("mockJobs data", () => {
  it("has unique ids", () => {
    expect(new Set(mockJobs.map((item) => item.id)).size).toBe(mockJobs.length);
  });

  it("has consistent salary ranges, valid scores and at least three tags", () => {
    for (const item of mockJobs) {
      expect(item.salaryMin, item.id).toBeLessThanOrEqual(item.salaryMax);
      expect(item.matchPercent, item.id).toBeGreaterThanOrEqual(0);
      expect(item.matchPercent, item.id).toBeLessThanOrEqual(100);
      expect(item.tags.length, item.id).toBeGreaterThanOrEqual(3);
      expect(item.benefits.length, item.id).toBeGreaterThan(0);
    }
  });
});
