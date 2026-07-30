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
  created_at: string;
  id: string;
  job_title: string;
  job_url: string | null;
  location: string | null;
  notes: string | null;
  status: ApplicationStatus;
  updated_at: string;
};

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return (
    typeof value === "string" &&
    applicationStatuses.includes(value as ApplicationStatus)
  );
}
