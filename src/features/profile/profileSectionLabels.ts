import type { ReadinessRequirementKey } from "./profile.utils";

// Labels for the profile-readiness checklist (shared translation keys with the
// Profile page's readiness card).
export const READINESS_LABEL_KEYS: Record<ReadinessRequirementKey, string> = {
  applicationPreferences: "profile.readiness.requirement.applicationPreferences",
  basics: "profile.readiness.requirement.basics",
  experience: "profile.readiness.requirement.experience",
  location: "profile.readiness.requirement.location",
  rolePreferences: "profile.readiness.requirement.rolePreferences",
  salary: "profile.readiness.requirement.salary",
  skills: "profile.readiness.requirement.skills",
  workAuthorization: "profile.readiness.requirement.workAuthorization",
};

export const READINESS_ORDER: ReadinessRequirementKey[] = [
  "basics",
  "location",
  "rolePreferences",
  "skills",
  "experience",
  "salary",
  "workAuthorization",
  "applicationPreferences",
];
