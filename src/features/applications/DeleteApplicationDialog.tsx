import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { Button } from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";
import type { Application } from "./types";

type DeleteApplicationDialogProps = {
  application: Application;
  onCancel: () => void;
  onDeleted: (id: string) => void;
};

export function DeleteApplicationDialog({
  application,
  onCancel,
  onDeleted,
}: DeleteApplicationDialogProps) {
  const { session } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        onCancel();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements.item(0);
      const lastElement = focusableElements.item(focusableElements.length - 1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleting, onCancel]);

  async function handleDelete() {
    const userId = session?.user.id;

    setErrorMessage("");

    if (!userId) {
      setErrorMessage("Your session is not available. Please log in again.");
      return;
    }

    setIsDeleting(true);

    const { data, error } = await supabase
      .from("applications")
      .delete()
      .eq("id", application.id)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      setErrorMessage(
        error?.message ?? "This application could not be found or deleted.",
      );
      setIsDeleting(false);
      return;
    }

    onDeleted(application.id);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-5">
      <button
        aria-label="Cancel deleting application"
        className="absolute inset-0 bg-brand-950/55 backdrop-blur-[2px]"
        disabled={isDeleting}
        onClick={onCancel}
        type="button"
      />
      <div
        aria-describedby="delete-application-description"
        aria-labelledby="delete-application-title"
        aria-modal="true"
        className="relative w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-2xl sm:p-8"
        ref={dialogRef}
        role="dialog"
      >
        <span className="grid size-11 place-items-center rounded-full bg-red-50 text-red-700">
          <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
            <path d="M9 3h6m-9 4h12m-10 0 .7 13h6.6L16 7m-5 4v5m2-5v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          </svg>
        </span>
        <h2 className="mt-5 text-2xl font-semibold" id="delete-application-title">
          Delete application?
        </h2>
        <p
          className="mt-3 text-sm leading-relaxed text-ink-muted"
          id="delete-application-description"
        >
          This permanently removes <strong className="text-ink">{application.job_title}</strong>{" "}
          at <strong className="text-ink">{application.company_name}</strong>. This action
          cannot be undone.
        </p>

        {errorMessage && (
          <p
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <Button
            disabled={isDeleting}
            onClick={onCancel}
            ref={cancelButtonRef}
            variant="secondary"
          >
            Keep application
          </Button>
          <Button disabled={isDeleting} onClick={handleDelete} variant="danger">
            {isDeleting ? "Deleting..." : "Delete permanently"}
          </Button>
        </div>
      </div>
    </div>
  );
}
