// Placeholder job-match data.
//
// There is no jobs/matching backend in this codebase yet (no table, no
// external job-board integration). This mock list exists purely so the
// dashboard's "Top job matches" section has something real-looking to
// render, matching the design handoff's own explicit framing ("placeholder
// data used -- replace with real"). Replace with a real data source once a
// jobs backend exists; do not add fields here speculatively ahead of that.

export type MockJob = {
  company: string;
  id: string;
  location: string;
  matchPercent: number;
  posted: string;
  tags: [string, string];
  title: string;
};

export const mockJobs: MockJob[] = [
  {
    company: "Nordstack",
    id: "1",
    location: "Berlin, DE",
    matchPercent: 92,
    posted: "a day ago",
    tags: ["Python", "ML pipelines"],
    title: "Machine Learning Engineer, Ranking",
  },
  {
    company: "Voltiq",
    id: "2",
    location: "Amsterdam, NL",
    matchPercent: 88,
    posted: "6 days ago",
    tags: ["Go", "Distributed systems"],
    title: "Backend Engineer, Platform",
  },
  {
    company: "Reef Labs",
    id: "3",
    location: "Remote, EU",
    matchPercent: 85,
    posted: "3 days ago",
    tags: ["Figma", "Design systems"],
    title: "Product Designer, Growth",
  },
  {
    company: "Kestrel",
    id: "4",
    location: "Munich, DE",
    matchPercent: 81,
    posted: "3 days ago",
    tags: ["SQL", "Experimentation"],
    title: "Data Scientist, Personalization",
  },
  {
    company: "Alpenwerk",
    id: "5",
    location: "Zurich, CH",
    matchPercent: 78,
    posted: "2 days ago",
    tags: ["React", "Node"],
    title: "Full-Stack Engineer",
  },
];
