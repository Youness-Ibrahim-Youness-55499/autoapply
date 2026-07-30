import type { ApplicationStatus } from "./types";

export const applicationStatusDetails: Record<
  ApplicationStatus,
  { label: string; styles: string }
> = {
  saved: { label: "Saved", styles: "bg-slate-100 text-slate-700" },
  applied: { label: "Applied", styles: "bg-blue-50 text-blue-700" },
  interview: { label: "Interview", styles: "bg-violet-50 text-violet-700" },
  offer: { label: "Offer", styles: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", styles: "bg-red-50 text-red-700" },
  withdrawn: { label: "Withdrawn", styles: "bg-amber-50 text-amber-800" },
};
