import { useEffect, useState } from "react";

export type RecommendedJob = {
  applyUrl: string | null;
  company: string;
  id: string;
  location: string;
  posted: string;
  provider: string | null;
  tags: string[];
  title: string;
};

type JobsResponse = {
  items: Array<{
    apply_url: string | null;
    company: string;
    employment_type: string | null;
    id: number;
    last_seen_at: string;
    location: string | null;
    provider: string | null;
    remote_type: string | null;
    title: string;
  }>;
};

const JOBS_API_URL = import.meta.env.VITE_JOBS_API_URL ?? "/job-api";

function formatPosted(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function useRecommendedJobs() {
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJobs() {
      try {
        setIsLoading(true);
        const response = await fetch(`${JOBS_API_URL}/jobs?country=DE&status=active&limit=20`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Job service returned ${response.status}.`);
        const payload = (await response.json()) as JobsResponse;
        setJobs(
          payload.items.map((job) => ({
            applyUrl: job.apply_url,
            company: job.company,
            id: String(job.id),
            location: job.location ?? "Germany",
            posted: formatPosted(job.last_seen_at),
            provider: job.provider,
            tags: [job.remote_type, job.employment_type].filter(
              (tag): tag is string => Boolean(tag),
            ),
            title: job.title,
          })),
        );
        setErrorMessage(null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErrorMessage(error instanceof Error ? error.message : "Could not load jobs.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadJobs();
    return () => controller.abort();
  }, []);

  return { errorMessage, isLoading, jobs };
}
