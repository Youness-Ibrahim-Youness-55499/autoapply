export const processStages = ["Find", "Prep", "Apply", "Track"] as const;

type ProcessTabsProps = {
  activeStage: number;
};

export function ProcessTabs({ activeStage }: ProcessTabsProps) {
  return (
    <ol
      aria-label="Application automation stages"
      className="flex items-center"
    >
        {processStages.map((stage, index) => (
          <li className="flex min-w-0 flex-1 items-center last:flex-none" key={stage}>
            <span
              aria-current={index === activeStage ? "step" : undefined}
              className={`relative z-10 flex h-12 min-w-24 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-300 sm:min-w-28 ${
                index === activeStage
                  ? "border-brand-950 bg-brand-950 text-white"
                  : index < activeStage
                    ? "border-brand-400 bg-white text-ink"
                    : "border-line bg-white text-ink-muted"
              }`}
            >
              <span
                className={`text-[0.625rem] font-bold ${
                  index === activeStage ? "text-white/75" : "text-ink-muted"
                }`}
              >
                0{index + 1}
              </span>
              {stage}
            </span>

            {index < processStages.length - 1 ? (
              <span className="mx-3 h-px min-w-6 flex-1 bg-line">
                <span
                  className="block h-full bg-brand-500 transition-[width] duration-500"
                  style={{ width: index < activeStage ? "100%" : "0%" }}
                />
              </span>
            ) : null}
          </li>
        ))}
    </ol>
  );
}

