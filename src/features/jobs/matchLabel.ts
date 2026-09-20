export function matchLabelKey(percent: number) {
  if (percent >= 90) return "jobs.detail.matchExcellent";
  if (percent >= 75) return "jobs.detail.matchGood";
  return "jobs.detail.matchFair";
}
