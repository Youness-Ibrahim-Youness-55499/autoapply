const sizeClasses = {
  lg: { inner: "size-20", outer: "size-24", text: "text-xl" },
  md: { inner: "size-11", outer: "size-14", text: "text-xs" },
} as const;

export function MatchRing({
  percent,
  size = "md",
}: {
  percent: number;
  size?: keyof typeof sizeClasses;
}) {
  const classes = sizeClasses[size];

  return (
    <div
      className={`relative grid shrink-0 place-items-center rounded-full ${classes.outer}`}
      style={{
        background: `conic-gradient(var(--color-brand-600) ${percent}%, var(--color-line) 0)`,
      }}
    >
      <div className={`grid place-items-center rounded-full bg-surface text-center leading-none ${classes.inner}`}>
        <div className={`font-extrabold ${classes.text}`}>{percent}%</div>
      </div>
    </div>
  );
}
