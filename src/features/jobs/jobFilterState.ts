import type { MockJob } from "./mockJobs";

export const SALARY_MIN = 30000;
export const SALARY_MAX = 120000;
export const SALARY_STEP = 5000;

export type JobFilterState = {
  companySizes: Set<string>;
  experienceLevels: Set<string>;
  industries: Set<string>;
  jobTypes: Set<string>;
  locations: Set<string>;
  salaryMax: number;
  salaryMin: number;
  skills: Set<string>;
  workModes: Set<string>;
};

export function createEmptyJobFilters(): JobFilterState {
  return {
    companySizes: new Set(),
    experienceLevels: new Set(),
    industries: new Set(),
    jobTypes: new Set(),
    locations: new Set(),
    salaryMax: SALARY_MAX,
    salaryMin: SALARY_MIN,
    skills: new Set(),
    workModes: new Set(),
  };
}

export function toggleInSet(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function passes(selected: Set<string>, value: string) {
  return selected.size === 0 || selected.has(value);
}

// The slider's top stop (SALARY_MAX) reads "€120K+", so it means "no upper limit".
export function jobMatchesFilters(job: MockJob, filters: JobFilterState) {
  const upperBound = filters.salaryMax >= SALARY_MAX ? Number.POSITIVE_INFINITY : filters.salaryMax;

  return (
    passes(filters.workModes, job.workMode) &&
    passes(filters.locations, job.location) &&
    passes(filters.jobTypes, job.jobType) &&
    passes(filters.experienceLevels, job.experienceLevel) &&
    passes(filters.companySizes, job.companySize) &&
    passes(filters.industries, job.industry) &&
    (filters.skills.size === 0 || job.tags.some((tag) => filters.skills.has(tag))) &&
    job.salaryMax >= filters.salaryMin &&
    job.salaryMin <= upperBound
  );
}

export function hasActiveJobFilters(filters: JobFilterState) {
  return (
    filters.companySizes.size > 0 ||
    filters.experienceLevels.size > 0 ||
    filters.industries.size > 0 ||
    filters.jobTypes.size > 0 ||
    filters.locations.size > 0 ||
    filters.skills.size > 0 ||
    filters.workModes.size > 0 ||
    filters.salaryMin > SALARY_MIN ||
    filters.salaryMax < SALARY_MAX
  );
}
