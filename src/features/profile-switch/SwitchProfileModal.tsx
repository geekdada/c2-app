import type { ReactNode } from "react";

import { ConfirmationModal } from "@/components/layout/ConfirmationModal";
import { diffManagedEnv } from "@/shared/schema";
import {
  managedKeyLabels,
  type ManagedEnv,
  type ManagedEnvKey,
  type Profile,
} from "@/shared/profiles";

type SwitchProfileModalProps = {
  isOpen: boolean;
  profile: Profile | null;
  currentManagedEnv: ManagedEnv;
  isBusy?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

function renderKeyList(title: string, keys: ManagedEnvKey[]): ReactNode {
  if (keys.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--app-text-subtle)]">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm text-[var(--app-text)]">
        {keys.map((key) => (
          <li key={key}>{managedKeyLabels[key]}</li>
        ))}
      </ul>
    </div>
  );
}

export function SwitchProfileModal({
  isOpen,
  profile,
  currentManagedEnv,
  isBusy = false,
  onClose,
  onConfirm,
}: SwitchProfileModalProps) {
  if (!profile) {
    return null;
  }

  const diff = diffManagedEnv(currentManagedEnv, profile.env);

  return (
    <ConfirmationModal
      cancelLabel="Keep current profile"
      confirmLabel="Switch profile"
      description="Only the managed Anthropic keys will change. Unset fields are deleted from Claude settings instead of being written as empty strings."
      details={
        <div className="grid gap-3 sm:grid-cols-3">
          {renderKeyList("Will add", diff.added)}
          {renderKeyList("Will update", diff.updated)}
          {renderKeyList("Will remove", diff.removed)}
        </div>
      }
      isBusy={isBusy}
      isOpen={isOpen}
      title={`Activate ${profile.name}?`}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
