import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useTranslation } from "../../i18n";

// The "Apply for this job?" confirmation shown before an application is
// tracked as applied -- used by both the Overview page's top-matches list
// and the Job Detail page, so the copy and behavior can't drift apart.
export function ApplyConfirmModal({
  company,
  isBusy,
  isOpen,
  jobTitle,
  onCancel,
  onConfirm,
}: {
  company: string;
  isBusy: boolean;
  isOpen: boolean;
  jobTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      cancelLabel={t("jobs.detail.cancel")}
      confirmLabel={t("jobs.detail.applyConfirm")}
      description={t("jobs.detail.applyBody", { company, title: jobTitle })}
      isBusy={isBusy}
      isOpen={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={t("jobs.detail.applyTitle")}
    />
  );
}
