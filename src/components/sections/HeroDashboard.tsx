import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "../../i18n";

type Status = "interview" | "offer" | "followUp" | "applied" | "closed";
type TabKey = "all" | "applications" | "interviews" | "offers";

type FeedItem = {
  id: string;
  status: Status;
  roleKey: string;
  companyKey: string;
  timeKey: string;
  summaryKey: string;
  nextStepKey: string;
  metaKey: string;
};

const items: FeedItem[] = [
  {
    id: "1",
    status: "interview",
    roleKey: "hero.dashboard.item1.role",
    companyKey: "hero.dashboard.item1.company",
    timeKey: "hero.dashboard.item1.time",
    summaryKey: "hero.dashboard.item1.summary",
    nextStepKey: "hero.dashboard.item1.nextStep",
    metaKey: "hero.dashboard.item1.meta",
  },
  {
    id: "2",
    status: "offer",
    roleKey: "hero.dashboard.item2.role",
    companyKey: "hero.dashboard.item2.company",
    timeKey: "hero.dashboard.item2.time",
    summaryKey: "hero.dashboard.item2.summary",
    nextStepKey: "hero.dashboard.item2.nextStep",
    metaKey: "hero.dashboard.item2.meta",
  },
  {
    id: "3",
    status: "followUp",
    roleKey: "hero.dashboard.item3.role",
    companyKey: "hero.dashboard.item3.company",
    timeKey: "hero.dashboard.item3.time",
    summaryKey: "hero.dashboard.item3.summary",
    nextStepKey: "hero.dashboard.item3.nextStep",
    metaKey: "hero.dashboard.item3.meta",
  },
  {
    id: "4",
    status: "applied",
    roleKey: "hero.dashboard.item4.role",
    companyKey: "hero.dashboard.item4.company",
    timeKey: "hero.dashboard.item4.time",
    summaryKey: "hero.dashboard.item4.summary",
    nextStepKey: "hero.dashboard.item4.nextStep",
    metaKey: "hero.dashboard.item4.meta",
  },
  {
    id: "5",
    status: "closed",
    roleKey: "hero.dashboard.item5.role",
    companyKey: "hero.dashboard.item5.company",
    timeKey: "hero.dashboard.item5.time",
    summaryKey: "hero.dashboard.item5.summary",
    nextStepKey: "hero.dashboard.item5.nextStep",
    metaKey: "hero.dashboard.item5.meta",
  },
];

const tabFilters: Record<TabKey, Status[] | null> = {
  all: null,
  applications: ["applied", "followUp", "closed"],
  interviews: ["interview"],
  offers: ["offer"],
};

const tabs: { key: TabKey; labelKey: string }[] = [
  { key: "all", labelKey: "hero.dashboard.tabAll" },
  { key: "applications", labelKey: "hero.dashboard.tabApplications" },
  { key: "interviews", labelKey: "hero.dashboard.tabInterviews" },
  { key: "offers", labelKey: "hero.dashboard.tabOffers" },
];

const navItems = [
  { key: "nav.overview", active: false },
  { key: "nav.applications", active: true },
  { key: "nav.interviews", active: false },
  { key: "nav.documents", active: false },
  { key: "nav.templates", active: false },
];

const statusBadgeStyles: Record<Status, string> = {
  interview: "bg-brand-500/20 text-brand-200",
  offer: "bg-emerald-400/15 text-emerald-200",
  followUp: "bg-amber-300/15 text-amber-100",
  applied: "bg-white/10 text-white/70",
  closed: "bg-white/[0.06] text-white/40",
};

const statusDotStyles: Record<Status, string> = {
  interview: "bg-brand-400",
  offer: "bg-emerald-400",
  followUp: "bg-amber-300",
  applied: "bg-white/40",
  closed: "bg-white/20",
};

export function HeroDashboard() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filters = tabFilters[activeTab];
  const visibleItems = filters ? items.filter((item) => filters.includes(item.status)) : items;

  return (
    <div className="relative mx-auto mt-14 max-w-6xl">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [background-image:radial-gradient(var(--color-border-default)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div
        aria-label={t("hero.dashboard.ariaLabel")}
        className="relative overflow-hidden rounded-card border border-line bg-surface-strong shadow-card"
        role="group"
      >
        <div className="grid lg:grid-cols-[15rem_1fr]">
          <nav className="hidden border-r border-white/10 p-4 lg:block">
            <p className="meta-label px-2 text-white/40">Jobman</p>
            <ul className="mt-4 space-y-1">
              {navItems.map((item) => (
                <li key={item.key}>
                  <span
                    className={`block rounded-md px-3 py-2 text-sm font-medium ${
                      item.active ? "bg-white/10 text-white" : "text-white/55"
                    }`}
                  >
                    {t(item.key)}
                  </span>
                </li>
              ))}
            </ul>

            <p className="meta-label mt-6 px-2 text-white/40">{t("hero.dashboard.favoritesLabel")}</p>
            <ul className="mt-2 space-y-1">
              <li>
                <span className="block rounded-md px-3 py-2 text-sm text-white/55">
                  {t("hero.dashboard.favoriteOne")}
                </span>
              </li>
              <li>
                <span className="block rounded-md px-3 py-2 text-sm text-white/55">
                  {t("hero.dashboard.favoriteTwo")}
                </span>
              </li>
            </ul>
          </nav>

          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-semibold text-white">{t("hero.dashboard.title")}</p>
              <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-medium text-brand-200">
                {t("hero.dashboard.updated")}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-1 border-b border-white/10">
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <button
                    aria-pressed={isActive}
                    className={`relative px-3 pb-3 text-sm font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-strong ${
                      isActive ? "text-white" : "text-white/50 hover:text-white/80"
                    }`}
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    type="button"
                  >
                    {t(tab.labelKey)}
                    {isActive ? (
                      <span className="absolute inset-x-0 -bottom-px h-px bg-brand-400" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <p className="meta-label mt-4 text-white/40">{t("hero.dashboard.groupThisWeek")}</p>

            <div className="mt-2 space-y-2">
              <AnimatePresence initial={false}>
                {visibleItems.map((item) => {
                  const isExpanded = expandedId === item.id;

                  return (
                    <motion.div
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.045]"
                      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                      initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
                      key={item.id}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <button
                        aria-expanded={isExpanded}
                        aria-label={t("hero.dashboard.expandLabel")}
                        className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors duration-[var(--duration-fast)] hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-strong"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        type="button"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{t(item.roleKey)}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeStyles[item.status]}`}
                            >
                              <span className={`size-1.5 rounded-full ${statusDotStyles[item.status]}`} />
                              {t(`hero.dashboard.status.${item.status}`)}
                            </span>
                            <span className="text-xs text-white/40">
                              {t(item.companyKey)} · {t(item.timeKey)}
                            </span>
                          </div>
                        </div>
                        <svg
                          aria-hidden="true"
                          className={`size-4 shrink-0 text-white/40 transition-transform duration-[var(--duration-fast)] ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded ? (
                          <motion.div
                            animate={reduceMotion ? undefined : { height: "auto", opacity: 1 }}
                            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                            initial={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <div className="border-t border-white/10 px-4 py-3">
                              <p className="text-sm leading-5 text-white/70">{t(item.summaryKey)}</p>
                              <p className="mt-2 text-sm leading-5 text-white/55">{t(item.nextStepKey)}</p>
                              <p className="mt-3 text-xs text-white/40">{t(item.metaKey)}</p>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.03] px-5 py-4">
          <span className="meta-label text-white/40">{t("hero.dashboard.metricActive")}</span>
          <span className="meta-label text-white/40">{t("hero.dashboard.metricOffers")}</span>
          <span className="meta-label text-white/40">{t("hero.dashboard.metricInterviews")}</span>
        </div>
      </div>
    </div>
  );
}
