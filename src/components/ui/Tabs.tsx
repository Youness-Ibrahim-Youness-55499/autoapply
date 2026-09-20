import type { ReactNode } from "react";

type Tab<T extends string> = { icon?: ReactNode; id: T; label: string };

type TabsProps<T extends string> = {
  active: T;
  label: string;
  onChange: (id: T) => void;
  tabs: Tab<T>[];
};

// Underline tabs (design system #09). The parent renders the active panel;
// this component only owns the tablist semantics + arrow-key navigation.
export function Tabs<T extends string>({ active, label, onChange, tabs }: TabsProps<T>) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const index = tabs.findIndex((tab) => tab.id === active);
    const nextIndex =
      event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
    onChange(tabs[nextIndex].id);
  }

  return (
    <div
      aria-label={label}
      className="flex flex-wrap gap-x-7 gap-y-1 border-b border-line"
      onKeyDown={handleKeyDown}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;

        return (
          <button
            aria-selected={isActive}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-0.5 pb-3 pt-1 text-sm font-semibold transition-colors ${
              isActive
                ? "border-brand-600 text-brand-800"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
