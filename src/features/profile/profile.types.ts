export const workPreferences = [
  "flexible",
  "remote",
  "hybrid",
  "onsite",
] as const;

export type WorkPreference = (typeof workPreferences)[number];

// i18n keys for each option, shared by ProfilePreferencesCard (read
// view) and ProfileEditModal (edit form) so the two never drift.
export const workPreferenceLabelKeys: Record<WorkPreference, string> = {
  flexible: "profile.workPreference.flexible",
  hybrid: "profile.workPreference.hybrid",
  onsite: "profile.workPreference.onsite",
  remote: "profile.workPreference.remote",
};

export const visaStatuses = [
  "citizen_or_permanent_resident",
  "has_work_permit",
  "requires_sponsorship",
  "prefer_not_to_say",
] as const;

export type VisaStatus = (typeof visaStatuses)[number];

export const visaStatusLabelKeys: Record<VisaStatus, string> = {
  citizen_or_permanent_resident: "profile.visaStatus.citizenOrPermanentResident",
  has_work_permit: "profile.visaStatus.hasWorkPermit",
  prefer_not_to_say: "profile.visaStatus.preferNotToSay",
  requires_sponsorship: "profile.visaStatus.requiresSponsorship",
};

export const applicationModes = ["manual", "auto"] as const;

export type ApplicationMode = (typeof applicationModes)[number];

export const applicationModeLabelKeys: Record<ApplicationMode, string> = {
  auto: "profile.applicationMode.auto",
  manual: "profile.applicationMode.manual",
};

export const employmentTypeOptions = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
] as const;

export const employmentTypeLabelKeys: Record<(typeof employmentTypeOptions)[number], string> = {
  "Contract": "profile.employmentType.contract",
  "Freelance": "profile.employmentType.freelance",
  "Full-time": "profile.employmentType.fullTime",
  "Internship": "profile.employmentType.internship",
  "Part-time": "profile.employmentType.partTime",
};

export type ExperienceEntry = {
  company: string;
  current: boolean;
  description: string;
  endDate: string;
  id: string;
  location: string;
  role: string;
  startDate: string;
};

export type EducationEntry = {
  degree: string;
  endDate: string;
  field: string;
  id: string;
  institution: string;
  startDate: string;
};

export type CandidateProfile = {
  applicationMode: ApplicationMode;
  desiredRoles: string[];
  education: EducationEntry[];
  employmentTypes: string[];
  excludedCompanies: string[];
  excludedIndustries: string[];
  experience: ExperienceEntry[];
  fullName: string;
  headline: string;
  location: string;
  minimumSalary: number | null;
  onboardingCompleted: boolean;
  preferredLanguages: string[];
  preferredLocations: string[];
  professionalSummary: string;
  skills: string[];
  visaStatus: VisaStatus;
  willingToRelocate: boolean;
  workPreference: WorkPreference;
};

export const emptyCandidateProfile: CandidateProfile = {
  applicationMode: "manual",
  desiredRoles: [],
  education: [],
  employmentTypes: [],
  excludedCompanies: [],
  excludedIndustries: [],
  experience: [],
  fullName: "",
  headline: "",
  location: "",
  minimumSalary: null,
  onboardingCompleted: false,
  preferredLanguages: [],
  preferredLocations: [],
  professionalSummary: "",
  skills: [],
  visaStatus: "prefer_not_to_say",
  willingToRelocate: false,
  workPreference: "flexible",
};
