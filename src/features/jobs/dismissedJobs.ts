// Dismissing a suggested job from the Overview "Top matches" list is
// UI-only -- there's no dismissed-jobs table, so this lives in this
// browser's localStorage only, same as saved searches.
const STORAGE_KEY = "jobman.dismissedJobIds";

export function loadDismissedJobIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

export function persistDismissedJobIds(ids: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Storage can be blocked (private window); dismissals then last for the session only.
  }
}
