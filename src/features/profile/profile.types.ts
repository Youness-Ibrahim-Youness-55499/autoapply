export const workPreferences = ["flexible", "remote", "hybrid", "onsite"] as const;
export type WorkPreference = (typeof workPreferences)[number];

export const workPreferenceLabelKeys: Record<WorkPreference, string> = {
  flexible: "profile.workPreference.flexible",
  hybrid: "profile.workPreference.hybrid",
  onsite: "profile.workPreference.onsite",
  remote: "profile.workPreference.remote",
};

export const employmentTypeOptions = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"] as const;
export const employmentTypeLabelKeys: Record<(typeof employmentTypeOptions)[number], string> = {
  Contract: "profile.employmentType.contract",
  Freelance: "profile.employmentType.freelance",
  "Full-time": "profile.employmentType.fullTime",
  Internship: "profile.employmentType.internship",
  "Part-time": "profile.employmentType.partTime",
};

export const languageLevels = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"] as const;
export type LanguageLevel = (typeof languageLevels)[number];

export const workAuthorizationOptions = ["eu_eea", "permanent_residence", "eu_blue_card", "job_seeker_visa", "requires_sponsorship", "other"] as const;
export type WorkAuthorization = "" | (typeof workAuthorizationOptions)[number];

export const travelWillingnessOptions = ["none", "occasional", "frequent"] as const;
export type TravelWillingness = (typeof travelWillingnessOptions)[number];

export const autoApplyLevels = ["excellent", "strong", "moderate"] as const;
export type AutoApplyLevel = (typeof autoApplyLevels)[number];

export const coverLetterPreferences = ["always", "required", "never"] as const;
export type CoverLetterPreference = (typeof coverLetterPreferences)[number];

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

export type LanguageEntry = {
  confirmed: boolean;
  id: string;
  level: LanguageLevel;
  name: string;
};

export type ApplicationExclusions = {
  blockedCompanies: string[];
  excludedIndustries: string[];
  jobsBelowSalary: boolean;
  jobsRequiringRelocation: boolean;
  recruitmentAgencies: boolean;
  temporaryContracts: boolean;
};

export type CandidateProfile = {
  applicationExclusions: ApplicationExclusions;
  autoApplyLevels: AutoApplyLevel[];
  companyTypes: string[];
  coverLetterPreference: CoverLetterPreference;
  cvTailoring: boolean;
  desiredRoles: string[];
  earliestStartDate: string;
  education: EducationEntry[];
  employmentTypes: string[];
  experience: ExperienceEntry[];
  fullName: string;
  headline: string;
  languages: LanguageEntry[];
  location: string;
  maximumSalary: number | null;
  minimumMatchScore: number;
  minimumSalary: number | null;
  noticePeriod: string;
  onboardingCompleted: boolean;
  preferredLocations: string[];
  professionalSummary: string;
  skills: string[];
  travelWillingness: TravelWillingness;
  willingToRelocate: boolean;
  workAuthorization: WorkAuthorization;
  workPreference: WorkPreference;
};

export const emptyApplicationExclusions: ApplicationExclusions = {
  blockedCompanies: [],
  excludedIndustries: [],
  jobsBelowSalary: false,
  jobsRequiringRelocation: false,
  recruitmentAgencies: false,
  temporaryContracts: false,
};

export const emptyCandidateProfile: CandidateProfile = {
  applicationExclusions: emptyApplicationExclusions,
  autoApplyLevels: [],
  companyTypes: [],
  coverLetterPreference: "required",
  cvTailoring: true,
  desiredRoles: [],
  earliestStartDate: "",
  education: [],
  employmentTypes: [],
  experience: [],
  fullName: "",
  headline: "",
  languages: [],
  location: "",
  maximumSalary: null,
  minimumMatchScore: 80,
  minimumSalary: null,
  noticePeriod: "",
  onboardingCompleted: false,
  preferredLocations: [],
  professionalSummary: "",
  skills: [],
  travelWillingness: "none",
  willingToRelocate: false,
  workAuthorization: "",
  workPreference: "flexible",
};
