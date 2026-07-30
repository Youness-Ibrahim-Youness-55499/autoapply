export const workPreferences = [
  "flexible",
  "remote",
  "hybrid",
  "onsite",
] as const;

export type WorkPreference = (typeof workPreferences)[number];

export const employmentTypeOptions = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
] as const;

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
  desiredRoles: string[];
  education: EducationEntry[];
  employmentTypes: string[];
  experience: ExperienceEntry[];
  fullName: string;
  headline: string;
  location: string;
  onboardingCompleted: boolean;
  professionalSummary: string;
  skills: string[];
  willingToRelocate: boolean;
  workPreference: WorkPreference;
};

export const emptyCandidateProfile: CandidateProfile = {
  desiredRoles: [],
  education: [],
  employmentTypes: [],
  experience: [],
  fullName: "",
  headline: "",
  location: "",
  onboardingCompleted: false,
  professionalSummary: "",
  skills: [],
  willingToRelocate: false,
  workPreference: "flexible",
};
