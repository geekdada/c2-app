import { ConfirmationModal } from "@/components/layout/ConfirmationModal";
import type { Profile } from "@/shared/profiles";

type DeleteProfileModalProps = {
  isOpen: boolean;
  profile: Profile | null;
  isOnlyProfile: boolean;
  isBusy?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function DeleteProfileModal({
  isOpen,
  profile,
  isOnlyProfile,
  isBusy = false,
  onClose,
  onConfirm,
}: DeleteProfileModalProps) {
  if (!profile) {
    return null;
  }

  return (
    <ConfirmationModal
      cancelLabel="Keep profile"
      confirmLabel="Delete profile"
      description={
        isOnlyProfile
          ? "This is your last saved profile. You can recreate one later, but the current record will be removed immediately."
          : "This removes the saved profile from the local app database. Claude settings stay untouched until you activate another profile."
      }
      isBusy={isBusy}
      isOpen={isOpen}
      title={`Delete ${profile.name}?`}
      tone="danger"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
