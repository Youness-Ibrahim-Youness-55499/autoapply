import { createEmptyJobFilters, type JobFilterState } from "./jobFilterState";

// Saved searches live in this browser only (localStorage). They hold search
// text, location and filters, never any personal data.
export type SavedSearch = {
  filters: SerializedFilters;
  id: string;
  location: string;
  query: string;
};

type SerializedFilters = Omit<
  JobFilterState,
  "companySizes" | "experienceLevels" | "industries" | "jobTypes" | "locations" | "skills" | "workModes"
> & {
  companySizes: string[];
  experienceLevels: string[];
  industries: string[];
  jobTypes: string[];
  locations: string[];
  skills: string[];
  workModes: string[];
};

const STORAGE_KEY = "jobman.savedJobSearches";
const MAX_SAVED = 6;

export function serializeFilters(filters: JobFilterState): SerializedFilters {
  return {
    companySizes: [...filters.companySizes],
    experienceLevels: [...filters.experienceLevels],
    industries: [...filters.industries],
    jobTypes: [...filters.jobTypes],
    locations: [...filters.locations],
    salaryMax: filters.salaryMax,
    salaryMin: filters.salaryMin,
    skills: [...filters.skills],
    visaSponsorshipOnly: filters.visaSponsorshipOnly,
    workModes: [...filters.workModes],
  };
}

export function deserializeFilters(filters: SerializedFilters): JobFilterState {
  const empty = createEmptyJobFilters();

  return {
    companySizes: new Set(filters.companySizes ?? []),
    experienceLevels: new Set(filters.experienceLevels ?? []),
    industries: new Set(filters.industries ?? []),
    jobTypes: new Set(filters.jobTypes ?? []),
    locations: new Set(filters.locations ?? []),
    salaryMax: filters.salaryMax ?? empty.salaryMax,
    salaryMin: filters.salaryMin ?? empty.salaryMin,
    skills: new Set(filters.skills ?? []),
    visaSponsorshipOnly: filters.visaSponsorshipOnly ?? empty.visaSponsorshipOnly,
    workModes: new Set(filters.workModes ?? []),
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

// localStorage is user-editable and may hold an older shape, so anything that
// doesn't look like a saved search is dropped instead of crashing the page.
function isSavedSearch(value: unknown): value is SavedSearch {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const filters = candidate.filters as Record<string, unknown> | null | undefined;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.query === "string" &&
    typeof candidate.location === "string" &&
    typeof filters === "object" &&
    filters !== null &&
    isStringArray(filters.companySizes) &&
    isStringArray(filters.experienceLevels) &&
    isStringArray(filters.industries) &&
    isStringArray(filters.jobTypes) &&
    isStringArray(filters.locations) &&
    isStringArray(filters.skills) &&
    isStringArray(filters.workModes) &&
    typeof filters.salaryMin === "number" &&
    typeof filters.salaryMax === "number"
  );
}

export function loadSavedSearches(): SavedSearch[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter(isSavedSearch).slice(0, MAX_SAVED) : [];
  } catch {
    return [];
  }
}

export function persistSavedSearches(searches: SavedSearch[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(searches.slice(0, MAX_SAVED)));
  } catch {
    // Storage can be blocked (private window); saved searches then last for the session only.
  }
}

export function createSavedSearch(query: string, location: string, filters: JobFilterState): SavedSearch {
  return {
    filters: serializeFilters(filters),
    id: `${Date.now()}`,
    location,
    query,
  };
}

// A short chip label built from what the search actually contains.
export function savedSearchParts(search: SavedSearch): string[] {
  const { filters } = search;

  return [
    search.query,
    search.location,
    ...filters.workModes,
    ...filters.jobTypes,
    ...filters.experienceLevels,
    ...filters.skills,
    ...filters.industries,
    ...filters.locations,
    ...(filters.visaSponsorshipOnly ? ["Visa sponsorship"] : []),
  ].filter((part) => part.length > 0);
}

export const MAX_SAVED_SEARCHES = MAX_SAVED;
