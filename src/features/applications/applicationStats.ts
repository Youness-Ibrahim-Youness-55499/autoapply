import type { Application } from "./types";

export function getApplicationStats(applications: Application[]) {
  const total = applications.length;
  const interviews = applications.filter((application) => application.status === "interview").length;
  const offers = applications.filter((application) => application.status === "offer").length;
  const submitted = applications.filter((application) => application.status !== "saved").length;
  const responded = applications.filter((application) =>
    ["interview", "offer", "rejected"].includes(application.status),
  ).length;
  const responseRate = submitted > 0 ? Math.round((responded / submitted) * 100) : 0;

  return { interviews, offers, responseRate, total };
}
