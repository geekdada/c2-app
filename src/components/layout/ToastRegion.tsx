import { X } from "lucide-react";
import { useEffect } from "react";

import { useUiStore, type ToastItem } from "@/app/store/ui";

type ToastCardProps = {
  toast: ToastItem;
};

function ToastCard({ toast }: ToastCardProps) {
  const dismissToast = useUiStore((state) => state.dismissToast);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      dismissToast(toast.id);
    }, 3600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [dismissToast, toast.id]);

  const accentColor =
    toast.tone === "success"
      ? "bg-emerald-400"
      : toast.tone === "error"
        ? "bg-rose-400"
        : "bg-sky-400";

  return (
    <div className="pointer-events-auto flex min-w-[280px] max-w-[360px] gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
      <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${accentColor}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--app-text)]">{toast.title}</p>
        {toast.description ? (
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">{toast.description}</p>
        ) : null}
      </div>
      <button
        className="shrink-0 rounded-full p-1 text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
        type="button"
        onClick={() => {
          dismissToast(toast.id);
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastRegion() {
  const toasts = useUiStore((state) => state.toasts);

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-[60] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
