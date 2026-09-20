import { describe, expect, it } from "vitest";
import { emptyCandidateProfile, type CandidateProfile } from "../profile/profile.types";
import { matchJob, skillMatches } from "./matchJob";
import type { MockJob } from "./mockJobs";

const job = {
  id: "t1",
  jobType: "Full-time",
  location: "Berlin, DE",
  matchPercent: 88,
  tags: ["Python", "SQL", "Kubernetes", "PostgreSQL"],
  workMode: "Hybrid",
} as MockJob;

function profile(overrides: Partial<CandidateProfile>): CandidateProfile {
  return { ...emptyCandidateProfile, ...overrides };
}

describe("skillMatches", () => {
  it("matches whole skills case-insensitively", () => {
    expect(skillMatches("Python", ["python"])).toBe(true);
    expect(skillMatches("ML pipelines", ["ML Pipelines"])).toBe(true);
  });

  it("matches a skill inside a longer phrase on whole words", () => {
    expect(skillMatches("Python", ["Python 3"])).toBe(true);
    expect(skillMatches("Design systems", ["UI design systems"])).toBe(true);
    expect(skillMatches("Node", ["Node.js"])).toBe(true);
  });

  it("does not match by substring", () => {
    expect(skillMatches("Go", ["Django"])).toBe(false);
    expect(skillMatches("C", ["C++"])).toBe(false);
    expect(skillMatches("C#", ["C"])).toBe(false);
    expect(skillMatches("Java", ["JavaScript"])).toBe(false);
  });

  it("handles empty input", () => {
    expect(skillMatches("", ["Python"])).toBe(false);
    expect(skillMatches("Python", [])).toBe(false);
    expect(skillMatches("Python", ["  "])).toBe(false);
  });
});

describe("matchJob", () => {
  it("falls back to the placeholder score when the profile has no skills", () => {
    const result = matchJob(job, profile({}));

    expect(result.isPlaceholder).toBe(true);
    expect(result.percent).toBe(88);
  });

  it("scores 100 when skills, location, work mode and job type all fit", () => {
    const result = matchJob(
      job,
      profile({
        employmentTypes: ["Full-time"],
        location: "Berlin, Germany",
        skills: ["Python", "SQL", "Kubernetes", "PostgreSQL"],
        workPreference: "hybrid",
      }),
    );

    expect(result.isPlaceholder).toBe(false);
    expect(result.percent).toBe(100);
    expect(result.missingSkills).toEqual([]);
    expect(result.locationFit).toBe(true);
  });

  it("weights skills at 60 points and reports the gaps", () => {
    const result = matchJob(
      job,
      profile({
        employmentTypes: ["Full-time"],
        location: "Berlin",
        skills: ["Python", "SQL"],
        workPreference: "hybrid",
      }),
    );

    // 60 * 2/4 skills + 20 location + 10 work mode + 10 job type
    expect(result.percent).toBe(70);
    expect(result.matchedSkills).toEqual(["Python", "SQL"]);
    expect(result.missingSkills).toEqual(["Kubernetes", "PostgreSQL"]);
  });

  it("loses the location and work-mode points when neither fits", () => {
    const result = matchJob(
      job,
      profile({
        employmentTypes: ["Contract"],
        location: "Munich",
        skills: ["Python", "SQL", "Kubernetes", "PostgreSQL"],
        workPreference: "onsite",
      }),
    );

    expect(result.locationFit).toBe(false);
    expect(result.percent).toBe(60);
  });

  it("counts willingness to relocate as a location fit", () => {
    const result = matchJob(job, profile({ location: "Munich", skills: ["Python"], willingToRelocate: true }));

    expect(result.locationFit).toBe(true);
  });

  it("treats a remote job as a fit for remote or flexible preferences", () => {
    const remoteJob = { ...job, location: "Remote, EU", workMode: "Remote" } as MockJob;

    expect(matchJob(remoteJob, profile({ location: "Munich", skills: ["Python"], workPreference: "remote" })).locationFit).toBe(true);
    expect(matchJob(remoteJob, profile({ location: "Munich", skills: ["Python"], workPreference: "flexible" })).locationFit).toBe(true);
    expect(matchJob(remoteJob, profile({ location: "Munich", skills: ["Python"], workPreference: "onsite" })).locationFit).toBe(false);
  });

  it("never exceeds 100", () => {
    const result = matchJob(
      job,
      profile({ employmentTypes: [], location: "Berlin", skills: ["Python", "SQL", "Kubernetes", "PostgreSQL", "Go"], workPreference: "flexible" }),
    );

    expect(result.percent).toBeLessThanOrEqual(100);
  });
});
