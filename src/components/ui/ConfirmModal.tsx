import { Button } from "./Button";
import { Modal } from "./Modal";

type ConfirmModalProps = {
  cancelLabel: string;
  confirmLabel: string;
  description: string;
  isBusy?: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  tone?: "danger" | "primary";
};

// "Apply for this job?"-style confirmation (design system #15) built on Modal.
export function ConfirmModal({
  cancelLabel,
  confirmLabel,
  description,
  isBusy = false,
  isOpen,
  onCancel,
  onConfirm,
  title,
  tone = "primary",
}: ConfirmModalProps) {
  return (
    <Modal
      footer={
        <>
          <Button disabled={isBusy} onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button disabled={isBusy} onClick={onConfirm} variant={tone}>
            {confirmLabel}
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
    >
      <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
    </Modal>
  );
}
