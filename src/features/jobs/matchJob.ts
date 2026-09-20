import type { CandidateProfile } from "../profile/profile.types";
import type { MockJob } from "./mockJobs";

export type JobMatch = {
  // True when the profile has no skills yet, so `percent` is the job's
  // placeholder score rather than something computed for this user.
  isPlaceholder: boolean;
  locationFit: boolean;
  matchedSkills: string[];
  missingSkills: string[];
  percent: number;
};

// Transparent, rule-based score (no AI): skills 60%, location 20%,
// work preference 10%, employment type 10%.
const WEIGHTS = { employment: 10, location: 20, skills: 60, workMode: 10 } as const;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

// Splits "Machine Learning" / "C++" / "Node.js" into whole tokens so that a short
// skill only matches as a whole word ("go" must not match "django", "c" not "c++").
function tokens(value: string) {
  return normalize(value)
    .replace(/\.js\b/g, "")
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length > 0);
}

export function skillMatches(jobSkill: string, profileSkills: string[]) {
  const wanted = tokens(jobSkill);
  if (wanted.length === 0) return false;

  return profileSkills.some((skill) => {
    const have = tokens(skill);
    if (have.length === 0) return false;
    const [shorter, longer] = wanted.length <= have.length ? [wanted, have] : [have, wanted];
    return shorter.every((token) => longer.includes(token));
  });
}

function cityOf(location: string) {
  return normalize(location.split(",")[0] ?? "");
}

const workModeByPreference: Record<string, MockJob["workMode"] | undefined> = {
  hybrid: "Hybrid",
  onsite: "On-site",
  remote: "Remote",
};

export function matchJob(job: MockJob, profile: CandidateProfile): JobMatch {
  const matchedSkills = job.tags.filter((tag) => skillMatches(tag, profile.skills));
  const missingSkills = job.tags.filter((tag) => !skillMatches(tag, profile.skills));

  const profileCity = cityOf(profile.location);
  const cityFit = profileCity.length > 0 && profileCity === cityOf(job.location);
  const remoteFit =
    job.workMode === "Remote" && (profile.workPreference === "remote" || profile.workPreference === "flexible");
  const locationFit = cityFit || remoteFit || profile.willingToRelocate;

  const workModeFit =
    profile.workPreference === "flexible" || workModeByPreference[profile.workPreference] === job.workMode;
  const employmentFit = profile.employmentTypes.length === 0 || profile.employmentTypes.includes(job.jobType);

  if (profile.skills.length === 0) {
    return {
      isPlaceholder: true,
      locationFit,
      matchedSkills,
      missingSkills,
      percent: job.matchPercent,
    };
  }

  const skillScore = job.tags.length > 0 ? matchedSkills.length / job.tags.length : 0;
  const percent = Math.round(
    WEIGHTS.skills * skillScore +
      (locationFit ? WEIGHTS.location : 0) +
      (workModeFit ? WEIGHTS.workMode : 0) +
      (employmentFit ? WEIGHTS.employment : 0),
  );

  return { isPlaceholder: false, locationFit, matchedSkills, missingSkills, percent };
}
