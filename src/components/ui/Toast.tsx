import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "../../i18n";

export type ToastType = "error" | "info" | "success" | "warning";

type ToastInput = { description?: string; title: string; type?: ToastType };
type ToastItem = ToastInput & { id: number; type: ToastType };

type ToastContextValue = { toast: (input: ToastInput) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 5000;

const typeStyles: Record<ToastType, { icon: ReactNode; ring: string }> = {
  error: {
    ring: "bg-red-100 text-red-600",
    icon: <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />,
  },
  info: {
    ring: "bg-blue-100 text-blue-600",
    icon: <path d="M12 11v6m0-10v.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />,
  },
  success: {
    ring: "bg-brand-100 text-brand-700",
    icon: <path d="m6.5 12.5 3.5 3.5 7.5-8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />,
  },
  warning: {
    ring: "bg-amber-100 text-amber-600",
    icon: <path d="M12 8v5m0 3.5v.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />,
  },
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const { t } = useTranslation();
  const styles = typeStyles[item.type];

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <div
      className="flex w-80 items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-lg"
      role={item.type === "error" ? "alert" : "status"}
    >
      <span className={`grid size-8 shrink-0 place-items-center rounded-full ${styles.ring}`}>
        <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
          {styles.icon}
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{item.title}</p>
        {item.description && <p className="mt-0.5 text-xs text-ink-muted">{item.description}</p>}
      </div>
      <button
        aria-label={t("toast.dismiss")}
        className="grid size-6 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-canvas hover:text-ink"
        onClick={() => onDismiss(item.id)}
        type="button"
      >
        <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 24 24">
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}

// Wrap the app once; call useToast().toast({ title, description, type })
// from anywhere below it.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    setItems((current) => [...current.slice(-3), { ...input, id: Date.now() + Math.random(), type: input.type ?? "info" }]);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
        {items.map((item) => (
          <div className="pointer-events-auto" key={item.id}>
            <ToastCard item={item} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
