import { useTranslation } from "../../i18n";

// Marks any figure or text that is illustrative rather than derived from the
// user's own data (AI-flavoured panels, placeholder job listings).
export function DemoBadge({ className = "" }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center rounded-full border border-dashed border-amber-300 bg-amber-50 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-amber-700 ${className}`}
      title={t("common.sampleDataHint")}
    >
      {t("common.sampleData")}
    </span>
  );
}
