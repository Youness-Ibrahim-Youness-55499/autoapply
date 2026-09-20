const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// "in 2 days", "3 days ago", "tomorrow" ... via Intl.RelativeTimeFormat so it
// follows the active UI locale without extra translation keys.
export function formatRelative(date: Date, locale: string, now: Date = new Date()) {
  const diff = date.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (abs < HOUR) return formatter.format(Math.round(diff / MINUTE), "minute");
  if (abs < DAY) return formatter.format(Math.round(diff / HOUR), "hour");
  if (abs < 30 * DAY) return formatter.format(Math.round(diff / DAY), "day");
  return formatter.format(Math.round(diff / (30 * DAY)), "month");
}
