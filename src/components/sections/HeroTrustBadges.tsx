import { useTranslation } from "../../i18n";

export function HeroTrustBadges() {
  const { t } = useTranslation();

  return (
    <ul
      aria-label={t("hero.trust.ariaLabel")}
      className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-6 sm:gap-9"
    >
      <li className="flex items-center justify-center">
        <img
          alt={t("hero.trust.aiActImageAlt")}
          className="h-auto w-36 rounded-md object-contain shadow-sm"
          src="/images/trust/eu-ai-act-compliant.png"
        />
      </li>

      <li className="flex items-center justify-center">
        <img
          alt={t("hero.trust.privacyImageAlt")}
          className="h-auto w-36 rounded-md object-contain shadow-sm"
          src="/images/trust/eu-gdpr-compliant.png"
        />
      </li>

      <li className="flex items-center justify-center">
        <img
          alt={t("hero.trust.germanyImageAlt")}
          className="h-[3.1rem] w-36 object-cover object-left"
          src="/images/trust/made-hosted-germany-dark.png"
        />
      </li>
    </ul>
  );
}
