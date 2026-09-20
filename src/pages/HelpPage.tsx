import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { Faq } from "../components/sections/Faq";
import { Card } from "../components/ui/Card";
import { useTranslation } from "../i18n";

export function HelpPage() {
  const { t } = useTranslation();
  const email = t("footer.contactEmail");

  return (
    <>
      <Seo description={t("help.description")} noIndex path="/app/help" title={t("help.title")} />
      <PageContainer className="pt-10 sm:pt-14 lg:px-10" size="wide">
        <ProductPageHeader description={t("help.description")} title={t("help.title")} />
      </PageContainer>
      <Faq />
      <PageContainer className="pb-14 lg:px-10" size="wide">
        <Card className="soft-card max-w-xl">
          <h2 className="text-lg font-bold">{t("help.contactTitle")}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t("help.contactBody")}</p>
          <a className="mt-3 inline-block text-sm font-semibold text-brand-700 underline underline-offset-4" href={`mailto:${email}`}>
            {email}
          </a>
        </Card>
      </PageContainer>
    </>
  );
}
