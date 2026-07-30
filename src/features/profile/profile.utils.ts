import {
  emptyCandidateProfile,
  workPreferences,
  type CandidateProfile,
  type EducationEntry,
  type ExperienceEntry,
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

export function normalizeProfile(
  value: unknown,
  fallbackName = "",
): CandidateProfile {
  if (!value || typeof value !== "object") {
    return { ...emptyCandidateProfile, fullName: fallbackName };
  }

  const row = value as Record<string, unknown>;

  return {
    desiredRoles: stringArray(row.desired_roles),
    education: educationEntries(row.education),
    employmentTypes: stringArray(row.employment_types),
    experience: experienceEntries(row.experience),
    fullName: stringValue(row.full_name) || fallbackName,
    headline: stringValue(row.headline),
    location: stringValue(row.location),
    onboardingCompleted: row.onboarding_completed === true,
    professionalSummary: stringValue(row.professional_summary),
    skills: stringArray(row.skills),
    willingToRelocate: row.willing_to_relocate === true,
    workPreference: isWorkPreference(row.work_preference)
      ? row.work_preference
      : "flexible",
  };
}

export function profileToRow(profile: CandidateProfile) {
  return {
    desired_roles: profile.desiredRoles,
    education: profile.education,
    employment_types: profile.employmentTypes,
    experience: profile.experience,
    full_name: profile.fullName.trim() || null,
    headline: profile.headline.trim() || null,
    location: profile.location.trim() || null,
    onboarding_completed: profile.onboardingCompleted,
    professional_summary: profile.professionalSummary.trim() || null,
    skills: profile.skills,
    willing_to_relocate: profile.willingToRelocate,
    work_preference: profile.workPreference,
    updated_at: new Date().toISOString(),
  };
}

export function getProfileCompletion(profile: CandidateProfile) {
  const sections = [
    {
      complete: Boolean(
        profile.fullName.trim() &&
          profile.headline.trim() &&
          profile.location.trim(),
      ),
      label: "Basic profile",
    },
    {
      complete:
        profile.desiredRoles.length > 0 && profile.employmentTypes.length > 0,
      label: "Work preferences",
    },
    { complete: profile.skills.length > 0, label: "Skills" },
    { complete: profile.experience.length > 0, label: "Experience" },
    { complete: profile.education.length > 0, label: "Education" },
  ];
  const completed = sections.filter((section) => section.complete).length;

  return {
    completed,
    missing: sections.filter((section) => !section.complete).map((section) => section.label),
    percentage: Math.round((completed / sections.length) * 100),
    total: sections.length,
  };
}
