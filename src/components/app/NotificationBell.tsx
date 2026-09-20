import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { interviewStageLabelKeys, type Application, type InterviewStage } from "../../features/applications/types";
import { selectUpcoming } from "../../features/applications/upcoming";
import { useWorkspaceEvents } from "../../features/applications/useWorkspaceEvents";
import { useTranslation } from "../../i18n";
import { formatRelative } from "../../lib/relativeTime";
import { BellIcon, CalendarIcon } from "../icons/BrandIcons";

const LOOKAHEAD_DAYS = 7;
const MAX_ITEMS = 6;

// Bell with a dropdown of what actually needs attention: overdue or
// soon-due reminders and upcoming interviews across all applications. The
// dot only shows when there is at least one such item.
export function NotificationBell({ applications }: { applications: Application[] }) {
  const { locale, t } = useTranslation();
  const { events } = useWorkspaceEvents();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => selectUpcoming(events, new Date(), LOOKAHEAD_DAYS), [events]);
  const applicationById = useMemo(() => new Map(applications.map((application) => [application.id, application])), [applications]);

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

  const now = new Date();

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={t("header.notifications")}
        className="relative grid size-10 shrink-0 place-items-center rounded-full border border-line bg-canvas text-ink-muted transition hover:bg-surface hover:text-ink"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <BellIcon className="size-5" />
        {items.length > 0 && (
          <span className="absolute right-2 top-2 size-2 rounded-full border border-white bg-brand-500" />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
          role="dialog"
        >
          <p className="border-b border-line px-4 py-3 text-sm font-bold">{t("header.notifications")}</p>

          {items.length === 0 ? (
            <p className="px-4 py-5 text-sm text-ink-muted">{t("header.notificationsEmpty")}</p>
          ) : (
            <ul className="max-h-80 divide-y divide-line overflow-y-auto">
              {items.slice(0, MAX_ITEMS).map((event) => {
                const application = applicationById.get(event.applicationId);
                const isOverdue = event.kind === "reminder" && event.at < now;
                const title =
                  event.kind === "interview"
                    ? t(interviewStageLabelKeys[event.title as InterviewStage] ?? "applications.interviewStage.other")
                    : event.title;

                return (
                  <li key={event.id}>
                    <Link
                      className="flex items-start gap-3 px-4 py-3 transition hover:bg-canvas"
                      onClick={() => setIsOpen(false)}
                      to={`/app/applications#${event.applicationId}`}
                    >
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                        <CalendarIcon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{title}</span>
                        {application && (
                          <span className="block truncate text-xs text-ink-muted">
                            {application.company_name} · {application.job_title}
                          </span>
                        )}
                        <span className={`text-xs font-semibold ${isOverdue ? "text-red-600" : "text-brand-700"}`}>
                          {isOverdue ? t("notifications.overdue") : formatRelative(event.at, locale, now)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
