export const applicationStatuses = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export type Application = {
  applied_at: string | null;
  company_name: string;
  cover_letter_document_id: string | null;
  created_at: string;
  cv_document_id: string | null;
  deadline: string | null;
  follow_up_at: string | null;
  id: string;
  job_description: string | null;
  job_title: string;
  job_url: string | null;
  location: string | null;
  notes: string | null;
  offer_amount: string | null;
  offer_date: string | null;
  offer_notes: string | null;
  recruiter_email: string | null;
  recruiter_name: string | null;
  recruiter_phone: string | null;
  rejection_reason: string | null;
  salary: string | null;
  status: ApplicationStatus;
  updated_at: string;
};

export const interviewStages = [
  "screening",
  "recruiter",
  "technical",
  "case_study",
  "onsite",
  "final",
  "other",
] as const;
export type InterviewStage = (typeof interviewStages)[number];

export const interviewStageLabels: Record<InterviewStage, string> = {
  case_study: "Case study",
  final: "Final interview",
  onsite: "On-site",
  other: "Other",
  recruiter: "Recruiter call",
  screening: "Screening",
  technical: "Technical interview",
};

export const reminderTypes = [
  "follow_up",
  "deadline",
  "interview",
  "task",
] as const;
export type ReminderType = (typeof reminderTypes)[number];
export const reminderTypeLabels: Record<ReminderType, string> = {
  deadline: "Deadline",
  follow_up: "Follow-up",
  interview: "Interview",
  task: "Task",
};

export type StatusHistory = {
  created_at: string;
  from_status: ApplicationStatus | null;
  id: string;
  to_status: ApplicationStatus;
};

export type ApplicationReminder = {
  completed_at: string | null;
  due_at: string;
  id: string;
  notes: string | null;
  reminder_type: ReminderType;
  title: string;
};

export type ApplicationInterview = {
  id: string;
  location: string | null;
  notes: string | null;
  scheduled_at: string;
  stage: InterviewStage;
};

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return (
    typeof value === "string" &&
    applicationStatuses.includes(value as ApplicationStatus)
  );
}

