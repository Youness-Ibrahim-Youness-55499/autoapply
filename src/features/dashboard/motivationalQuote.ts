// A tiny, deterministic hash so a given seed always picks the same quote
// index -- no randomness, no extra storage. The Overview page seeds this
// with the session's `last_sign_in_at`, so the quote is stable while
// browsing (reloads, navigating away and back) but changes on the next
// actual login, when that timestamp changes.
export function pickQuoteIndex(seed: string, count: number): number {
  if (count <= 0) return 0;

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) % count;
}
