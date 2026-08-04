import type { ApplicationStatus } from "./types";

export const applicationStatusDetails: Record<
  ApplicationStatus,
  { labelKey: string; styles: string }
> = {
  saved: { labelKey: "status.saved", styles: "bg-slate-100 text-slate-700" },
  applied: { labelKey: "status.applied", styles: "bg-blue-50 text-blue-700" },
  interview: { labelKey: "status.interview", styles: "bg-violet-50 text-violet-700" },
  offer: { labelKey: "status.offer", styles: "bg-emerald-50 text-emerald-700" },
  rejected: { labelKey: "status.rejected", styles: "bg-red-50 text-red-700" },
  withdrawn: { labelKey: "status.withdrawn", styles: "bg-amber-50 text-amber-800" },
};
