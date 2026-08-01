import { useAuth } from "../auth/AuthProvider";
import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { useTranslation } from "../i18n";

export function SettingsPage() {
  const { session } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <Seo
        description={t("seo.settingsDescription")}
        noIndex
        path="/app/settings"
        title={t("settings.title")}
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <ProductPageHeader
          description={t("settings.description")}
          title={t("settings.title")}
        />

        <section className="mt-10 max-w-3xl overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <div className="border-b border-line p-6 sm:p-8">
            <p className="eyebrow">Account</p>
            <h3 className="mt-3 text-xl font-semibold">{t("settings.signInEmail")}</h3>
            <p className="mt-2 break-all text-sm text-ink-muted">{session?.user.email}</p>
          </div>
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold">{t("settings.noPreferencesTitle")}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
              {t("settings.noPreferencesDescription")}
            </p>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
