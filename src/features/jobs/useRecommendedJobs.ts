import { useCallback, useEffect, useState } from "react";

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
  has_more: boolean;
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
const PAGE_SIZE = 20;

function formatPosted(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function useRecommendedJobs(searchQuery = "") {
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPage = useCallback(async (offset: number, signal?: AbortSignal) => {
    const params = new URLSearchParams({
      country: "DE",
      limit: String(PAGE_SIZE),
      offset: String(offset),
      status: "active",
    });
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    const response = await fetch(
      `${JOBS_API_URL}/jobs?${params.toString()}`,
      { signal },
    );
    if (!response.ok) throw new Error(`Job service returned ${response.status}.`);
    const payload = (await response.json()) as JobsResponse;
    const nextJobs = payload.items.map((job) => ({
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
    }));
    setJobs((current) => offset === 0 ? nextJobs : [...current, ...nextJobs]);
    setHasMore(payload.has_more);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJobs() {
      try {
        setIsLoading(true);
        await loadPage(0, controller.signal);
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
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      await loadPage(jobs.length);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load jobs.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, jobs.length, loadPage]);

  return { errorMessage, hasMore, isLoading, isLoadingMore, jobs, loadMore };
}
