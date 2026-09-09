import {
  autoApplyLevels,
  coverLetterPreferences,
  emptyCandidateProfile,
  languageLevels,
  travelWillingnessOptions,
  workAuthorizationOptions,
  workPreferences,
  type ApplicationExclusions,
  type AutoApplyLevel,
  type CandidateProfile,
  type CoverLetterPreference,
  type EducationEntry,
  type ExperienceEntry,
  type LanguageEntry,
  type TravelWillingness,
  type WorkAuthorization,
  type WorkPreference,
} from "./profile.types";

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function nullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function enumValue<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && options.includes(value as T) ? (value as T) : fallback;
}

function isWorkPreference(value: unknown): value is WorkPreference {
  return (
    typeof value === "string" &&
    workPreferences.includes(value as WorkPreference)
  );
}

function experienceEntries(value: unknown): ExperienceEntry[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    const id = stringValue(entry.id);
    const company = stringValue(entry.company);
    const role = stringValue(entry.role);
    if (!id || !company || !role) return [];

    return [{
      id,
      company,
      role,
      location: stringValue(entry.location),
      startDate: stringValue(entry.startDate),
      endDate: stringValue(entry.endDate),
      current: entry.current === true,
      description: stringValue(entry.description),
    }];
  });
}

function educationEntries(value: unknown): EducationEntry[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    const id = stringValue(entry.id);
    const institution = stringValue(entry.institution);
    const degree = stringValue(entry.degree);
    if (!id || !institution || !degree) return [];

    return [{
      id,
      institution,
      degree,
      field: stringValue(entry.field),
      startDate: stringValue(entry.startDate),
      endDate: stringValue(entry.endDate),
    }];
  });
}

function languageEntries(value: unknown): LanguageEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    const id = stringValue(entry.id);
    const name = stringValue(entry.name);
    const level = enumValue(entry.level, languageLevels, "A1");
    return id && name ? [{ id, name, level, confirmed: entry.confirmed === true }] : [];
  });
}

function exclusions(value: unknown): ApplicationExclusions {
  const row = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    blockedCompanies: stringArray(row.blockedCompanies),
    excludedIndustries: stringArray(row.excludedIndustries),
    jobsBelowSalary: row.jobsBelowSalary === true,
    jobsRequiringRelocation: row.jobsRequiringRelocation === true,
    recruitmentAgencies: row.recruitmentAgencies === true,
    temporaryContracts: row.temporaryContracts === true,
  };
}

export function normalizeProfile(
  value: unknown,
  fallbackName = "",
): CandidateProfile {
  if (!value || typeof value !== "object") {
    return { ...emptyCandidateProfile, fullName: fallbackName };
  }

  const row = value as Record<string, unknown>;

  return {
    applicationExclusions: exclusions(row.application_exclusions),
    autoApplyLevels: stringArray(row.auto_apply_levels).filter((item): item is AutoApplyLevel => autoApplyLevels.includes(item as AutoApplyLevel)),
    companyTypes: stringArray(row.company_types),
    coverLetterPreference: enumValue(row.cover_letter_preference, coverLetterPreferences, "required") as CoverLetterPreference,
    cvTailoring: row.cv_tailoring !== false,
    desiredRoles: stringArray(row.desired_roles),
    earliestStartDate: stringValue(row.earliest_start_date),
    education: educationEntries(row.education),
    employmentTypes: stringArray(row.employment_types),
    experience: experienceEntries(row.experience),
    fullName: stringValue(row.full_name) || fallbackName,
    headline: stringValue(row.headline),
    languages: languageEntries(row.languages),
    location: stringValue(row.location),
    maximumSalary: nullableNumber(row.maximum_salary),
    minimumMatchScore: nullableNumber(row.minimum_match_score) ?? 80,
    minimumSalary: nullableNumber(row.minimum_salary),
    noticePeriod: stringValue(row.notice_period),
    onboardingCompleted: row.onboarding_completed === true,
    professionalSummary: stringValue(row.professional_summary),
    preferredLocations: stringArray(row.preferred_locations),
    skills: stringArray(row.skills),
    travelWillingness: enumValue(row.travel_willingness, travelWillingnessOptions, "none") as TravelWillingness,
    willingToRelocate: row.willing_to_relocate === true,
    workAuthorization: enumValue(row.work_authorization, workAuthorizationOptions, "") as WorkAuthorization,
    workPreference: isWorkPreference(row.work_preference)
      ? row.work_preference
      : "flexible",
  };
}

export function profileToRow(profile: CandidateProfile) {
  return {
    application_exclusions: profile.applicationExclusions,
    auto_apply_levels: profile.autoApplyLevels,
    company_types: profile.companyTypes,
    cover_letter_preference: profile.coverLetterPreference,
    cv_tailoring: profile.cvTailoring,
    desired_roles: profile.desiredRoles,
    earliest_start_date: profile.earliestStartDate || null,
    education: profile.education,
    employment_types: profile.employmentTypes,
    experience: profile.experience,
    full_name: profile.fullName.trim() || null,
    headline: profile.headline.trim() || null,
    languages: profile.languages,
    location: profile.location.trim() || null,
    maximum_salary: profile.maximumSalary,
    minimum_match_score: profile.minimumMatchScore,
    minimum_salary: profile.minimumSalary,
    notice_period: profile.noticePeriod.trim() || null,
    onboarding_completed: profile.onboardingCompleted,
    professional_summary: profile.professionalSummary.trim() || null,
    preferred_locations: profile.preferredLocations,
    skills: profile.skills,
    travel_willingness: profile.travelWillingness,
    willing_to_relocate: profile.willingToRelocate,
    work_authorization: profile.workAuthorization || null,
    work_preference: profile.workPreference,
    updated_at: new Date().toISOString(),
  };
}

export type ReadinessRequirementKey = "applicationPreferences" | "basics" | "experience" | "location" | "rolePreferences" | "salary" | "skills" | "workAuthorization";

export const readinessWeights: Record<ReadinessRequirementKey, number> = {
  applicationPreferences: 5,
  basics: 20,
  experience: 15,
  location: 10,
  rolePreferences: 20,
  salary: 5,
  skills: 15,
  workAuthorization: 10,
};

export function getJobReadiness(profile: CandidateProfile) {
  const complete: Record<ReadinessRequirementKey, boolean> = {
    applicationPreferences: profile.autoApplyLevels.length > 0,
    basics: Boolean(profile.fullName.trim() && profile.headline.trim() && profile.professionalSummary.trim()),
    experience: profile.experience.length > 0,
    location: Boolean(profile.location.trim() || profile.preferredLocations.length > 0),
    rolePreferences: profile.desiredRoles.length > 0 && profile.employmentTypes.length > 0,
    salary: profile.minimumSalary !== null,
    skills: profile.skills.length >= 3,
    workAuthorization: Boolean(profile.workAuthorization),
  };
  const score = (Object.keys(readinessWeights) as ReadinessRequirementKey[]).reduce(
    (total, key) => total + (complete[key] ? readinessWeights[key] : 0),
    0,
  );
  const missing = (Object.keys(complete) as ReadinessRequirementKey[]).filter((key) => !complete[key]);
  return {
    complete,
    missing,
    percentage: score,
    readyToApply: score >= 90 && complete.workAuthorization && complete.applicationPreferences,
    readyToSearch: score >= 60 && complete.rolePreferences && complete.location,
  };
}

export function getProfileCompletion(profile: CandidateProfile) {
  const readiness = getJobReadiness(profile);
  return {
    completed: Object.values(readiness.complete).filter(Boolean).length,
    missing: readiness.missing,
    percentage: readiness.percentage,
    total: Object.keys(readiness.complete).length,
  };
}
