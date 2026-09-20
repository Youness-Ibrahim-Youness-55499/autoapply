import { describe, expect, it } from "vitest";
import type { MockJob } from "../jobs/mockJobs";
import { emptyCandidateProfile, type CandidateProfile } from "../profile/profile.types";
import { cvText, demoOptimizer, profileToCv, wordCount } from "./cvOptimizer";

const job = {
  company: "Nordstack",
  tags: ["React", "TypeScript", "Python", "SQL"],
  title: "Frontend Engineer",
} as MockJob;

const profile: CandidateProfile = {
  ...emptyCandidateProfile,
  education: [{ degree: "BSc", endDate: "2020", field: "Computer Science", id: "e1", institution: "TU Berlin", startDate: "2017" }],
  experience: [
    {
      company: "Acme",
      current: true,
      description: "Built a dashboard in React. Reduced load time by 30%.",
      endDate: "",
      id: "x1",
      location: "Berlin",
      role: "Developer",
      startDate: "2021",
    },
  ],
  fullName: "Alex Example",
  headline: "Developer",
  professionalSummary: "Developer who likes clean interfaces.",
  skills: ["Figma", "React", "Python"],
};

describe("profileToCv", () => {
  it("lays the real profile out as a CV", () => {
    const cv = profileToCv(profile);

    expect(cv.name).toBe("Alex Example");
    expect(cv.education).toEqual(["BSc, Computer Science, TU Berlin"]);
    expect(cv.experience[0].period).toBe("2021 – Present");
    expect(cv.experience[0].bullets).toEqual(["Built a dashboard in React.", "Reduced load time by 30%."]);
  });

  it("copes with an empty profile", () => {
    const cv = profileToCv(emptyCandidateProfile);

    expect(cv.experience).toEqual([]);
    expect(wordCount(cv)).toBe(0);
  });
});

describe("wordCount", () => {
  it("counts words across every section", () => {
    const cv = profileToCv(profile);

    expect(wordCount(cv)).toBe(cvText(cv).split(/\s+/).length);
    expect(wordCount(cv)).toBeGreaterThan(15);
  });
});

describe("demoOptimizer", () => {
  it("splits the job's keywords into covered and missing", async () => {
    const result = await demoOptimizer.optimize({ job, profile });

    expect(result.keywordsCovered).toEqual(["React", "Python"]);
    expect(result.keywordsMissing).toEqual(["TypeScript", "SQL"]);
  });

  it("never adds a skill the user did not list", async () => {
    const result = await demoOptimizer.optimize({ job, profile });

    expect([...result.optimized.skills].sort()).toEqual([...profile.skills].sort());
  });

  it("moves the job's keywords to the front of the skills list", async () => {
    const result = await demoOptimizer.optimize({ job, profile });

    expect(result.optimized.skills.slice(0, 2)).toEqual(["React", "Python"]);
    expect(result.changes.some((change) => change.kind === "skillsOrder")).toBe(true);
  });

  it("leads the summary with the target role and keeps the original text", async () => {
    const result = await demoOptimizer.optimize({ job, profile });

    expect(result.optimized.summary.startsWith("Frontend Engineer candidate")).toBe(true);
    expect(result.optimized.summary.endsWith(profile.professionalSummary)).toBe(true);
  });

  it("does not change the experience or education", async () => {
    const original = profileToCv(profile);
    const result = await demoOptimizer.optimize({ job, profile });

    expect(result.optimized.experience).toEqual(original.experience);
    expect(result.optimized.education).toEqual(original.education);
  });

  it("suggests adding the target role to a headline that lacks it", async () => {
    const result = await demoOptimizer.optimize({ job, profile });

    expect(result.changes).toContainEqual({ kind: "headline", role: "Frontend Engineer" });
  });

  it("falls back to the job title when there is no headline", async () => {
    const result = await demoOptimizer.optimize({ job, profile: { ...profile, headline: "" } });

    expect(result.optimized.headline).toBe("Frontend Engineer");
  });
});
