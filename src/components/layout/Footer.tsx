import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n";
import { BrandLogo } from "../BrandLogo";
import { PageContainer } from "./PageContainer";

const footerGroups = [
  {
    links: [
      ["nav.pricing", "#pricing"],
      ["nav.faq", "#faq"],
    ],
    titleKey: "footer.group.product",
  },
  {
    links: [
      ["footer.link.contact", "mailto:hello@jobman.app"],
      ["nav.faq", "#faq"],
      ["footer.link.backToTop", "#top"],
    ],
    titleKey: "footer.group.help",
  },
  {
    links: [
      ["footer.link.privacy", "/privacy"],
      ["footer.link.terms", "/terms"],
      ["footer.link.legalNotice", "/legal-notice"],
    ],
    titleKey: "footer.group.legal",
  },
];

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-line bg-surface" id="footer">
      <PageContainer>
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.75fr_0.75fr_0.75fr]">
          <div>
            <a
              className="text-xl font-bold text-brand-900"
              href="#top"
            >
              <BrandLogo />
            </a>
            <p className="body-copy mt-4 max-w-sm">
              {t("footer.description")}
            </p>
            <a
              className="mt-6 inline-block text-sm font-semibold text-brand-800 underline decoration-brand-200 underline-offset-4"
              href="mailto:hello@jobman.app"
            >
              {t("footer.contactEmail")}
            </a>
          </div>

          {footerGroups.map((group) => (
            <nav aria-label={`${t(group.titleKey)} links`} key={group.titleKey}>
              <p className="text-sm font-semibold">{t(group.titleKey)}</p>
              <ul className="mt-4 space-y-3">
                {group.links.map(([labelKey, href]) => (
                  <li key={labelKey}>
                    {href.startsWith("/") ? (
                      <Link
                        className="text-sm text-ink-muted hover:text-brand-800"
                        to={href}
                      >
                        {t(labelKey)}
                      </Link>
                    ) : (
                      <a
                        className="text-sm text-ink-muted hover:text-brand-800"
                        href={href}
                      >
                        {t(labelKey)}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.copyright")}</p>
          <p>{t("footer.tagline")}</p>
        </div>
      </PageContainer>
    </footer>
  );
}

