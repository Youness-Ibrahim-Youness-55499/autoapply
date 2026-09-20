import { useEffect, useRef, useState } from "react";

type ActionMenuItem = { danger?: boolean; label: string; onSelect: () => void };

// Kebab (⋮) menu for card/row actions.
export function ActionMenu({ items, label }: { items: ActionMenuItem[]; label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={label}
        className="grid size-8 place-items-center rounded-lg text-ink-muted transition hover:bg-canvas hover:text-ink"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="12" cy="19" r="1.7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg" role="menu">
          {items.map((item) => (
            <button
              className={`block w-full px-3.5 py-2 text-left text-sm font-medium transition hover:bg-canvas ${
                item.danger ? "text-red-600" : "text-ink"
              }`}
              key={item.label}
              onClick={() => {
                setIsOpen(false);
                item.onSelect();
              }}
              role="menuitem"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
