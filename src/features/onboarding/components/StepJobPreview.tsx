import { Button } from "../../../components/ui/Button";
import { useTranslation } from "../../../i18n";
import { mockJobs } from "../../jobs/mockJobs";

type StepJobPreviewProps = {
  isSaving: boolean;
  onFinish: () => void;
};

const cardTints = ["bg-brand-50", "bg-brand-100"] as const;

// Reuses the same placeholder mockJobs.ts data as the dashboard's "Top
// job matches" section -- there's no real matching backend yet, so this
// is explicitly framed as a preview, not personalized results.
export function StepJobPreview({ isSaving, onFinish }: StepJobPreviewProps) {
  const { t } = useTranslation();

  return (
    <div>
      <p className="eyebrow">{t("onboarding.preview.eyebrow")}</p>
      <h2 className="mt-2 text-2xl font-semibold">{t("onboarding.preview.title")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {t("onboarding.preview.description")}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {mockJobs.slice(0, 4).map((job, index) => (
          <div className={`rounded-xl ${cardTints[index % cardTints.length]} p-4`} key={job.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight">{job.title}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-ink-muted">
                  {job.company} · {job.location}
                </p>
              </div>
              <div className="shrink-0 rounded-full border-2 border-ink/15 bg-white px-2 py-1 text-xs font-extrabold">
                {job.matchPercent}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button disabled={isSaving} onClick={onFinish}>
          {isSaving ? t("profile.saving") : t("onboarding.preview.finish")}
        </Button>
      </div>
    </div>
  );
}
