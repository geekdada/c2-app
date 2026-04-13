import { Button } from "@heroui/react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  details?: ReactNode;
  isBusy?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  details,
  isBusy = false,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[var(--app-text)]">{title}</h3>
          <p className="text-sm leading-6 text-[var(--app-text-muted)]">{description}</p>
        </div>
        {details ? <div className="mt-4">{details}</div> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onPress={onClose}>
            {cancelLabel}
          </Button>
          <Button
            isDisabled={isBusy}
            variant={tone === "danger" ? "danger" : "primary"}
            onPress={() => {
              void onConfirm();
            }}
          >
            {isBusy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
