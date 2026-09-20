import type { MockJob } from "../jobs/mockJobs";
import type { CandidateProfile } from "../profile/profile.types";

// The CV Optimizer talks to a `CvOptimizer`. Today that is `demoOptimizer`, a
// deterministic rule-based rewrite that runs in the browser and is shown with a
// "Sample data" badge. To use a real model later, implement this interface with
// a call to a server-side endpoint (for example a Supabase Edge Function that
// wraps the Groq tailoring pipeline) so no API key ever reaches the browser.

export type CvExperience = {
  bullets: string[];
  company: string;
  period: string;
  role: string;
};

export type CvDocument = {
  education: string[];
  experience: CvExperience[];
  headline: string;
  name: string;
  skills: string[];
  summary: string;
};

export type CvChange =
  | { kind: "headline"; role: string }
  | { kind: "keywords"; keywords: string[] }
  | { kind: "skillsOrder"; count: number }
  | { kind: "summary"; company: string; role: string };

export type CvOptimization = {
  changes: CvChange[];
  keywordsCovered: string[];
  keywordsMissing: string[];
  optimized: CvDocument;
};

export type CvOptimizer = {
  optimize(input: { job: MockJob; profile: CandidateProfile }): Promise<CvOptimization>;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function covers(haystack: string, keyword: string) {
  return normalize(haystack).includes(normalize(keyword));
}

function period(startDate: string, endDate: string, isCurrent: boolean) {
  const end = isCurrent ? "Present" : endDate;
  return [startDate, end].filter((part) => part.length > 0).join(" – ");
}

function bulletsFrom(description: string) {
  return description
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((line) => line.replace(/^[-•*\s]+/, "").trim())
    .filter((line) => line.length > 0);
}

// The user's real profile, laid out as a CV.
export function profileToCv(profile: CandidateProfile): CvDocument {
  return {
    education: profile.education.map((entry) =>
      [entry.degree, entry.field, entry.institution].filter((part) => part.length > 0).join(", "),
    ),
    experience: profile.experience.map((entry) => ({
      bullets: bulletsFrom(entry.description),
      company: entry.company,
      period: period(entry.startDate, entry.endDate, entry.current),
      role: entry.role,
    })),
    headline: profile.headline,
    name: profile.fullName,
    skills: profile.skills,
    summary: profile.professionalSummary,
  };
}

export function cvText(cv: CvDocument) {
  return [
    cv.name,
    cv.headline,
    cv.summary,
    ...cv.skills,
    ...cv.education,
    ...cv.experience.flatMap((entry) => [entry.role, entry.company, entry.period, ...entry.bullets]),
  ]
    .filter((part) => part.length > 0)
    .join(" ");
}

export function wordCount(cv: CvDocument) {
  const text = cvText(cv);
  return text.length === 0 ? 0 : text.split(/\s+/).length;
}

export const demoOptimizer: CvOptimizer = {
  async optimize({ job, profile }) {
    const original = profileToCv(profile);
    const text = cvText(original);

    const keywordsCovered = job.tags.filter((tag) => covers(text, tag));
    const keywordsMissing = job.tags.filter((tag) => !covers(text, tag));
    const changes: CvChange[] = [];

    // Headline: name the target role. Uses the job title, not new claims.
    const headline = original.headline.length > 0 ? original.headline : job.title;
    if (!covers(original.headline, job.title)) {
      changes.push({ kind: "headline", role: job.title });
    }

    // Summary: lead with the target role and the keywords the user really has.
    const lead =
      keywordsCovered.length > 0
        ? `${job.title} candidate with hands-on experience in ${keywordsCovered.join(", ")}.`
        : `Candidate targeting the ${job.title} role at ${job.company}.`;
    const summary = [lead, original.summary].filter((part) => part.length > 0).join(" ");
    changes.push({ company: job.company, kind: "summary", role: job.title });

    // Skills: keep exactly what the user listed, but put the job's keywords first.
    const matching = original.skills.filter((skill) => job.tags.some((tag) => covers(skill, tag) || covers(tag, skill)));
    const rest = original.skills.filter((skill) => !matching.includes(skill));
    const skills = [...matching, ...rest];
    if (matching.length > 0 && skills.some((skill, index) => skill !== original.skills[index])) {
      changes.push({ count: matching.length, kind: "skillsOrder" });
    }

    if (keywordsCovered.length > 0) {
      changes.push({ keywords: keywordsCovered, kind: "keywords" });
    }

    return {
      changes,
      keywordsCovered,
      keywordsMissing,
      optimized: { ...original, headline, skills, summary },
    };
  },
};
