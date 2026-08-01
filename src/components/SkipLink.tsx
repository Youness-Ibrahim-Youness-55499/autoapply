import { useTranslation } from "../i18n";

export function SkipLink() {
  const { t } = useTranslation();

  return (
    <a
      className="fixed left-4 top-4 z-50 -translate-y-24 rounded-full bg-brand-950 px-4 py-2 text-sm font-semibold text-white shadow-button transition-transform focus:translate-y-0"
      href="#main-content"
    >
      {t("skipLink.mainContent")}
    </a>
  );
}

