import { Button, Card, CardContent, CardFooter, CardHeader } from "@heroui/react";
import { ArrowRightLeft, Pencil, Trash2 } from "lucide-react";

import { sortProfiles } from "@/app/store/profiles";
import { managedEnvKeys, managedKeyLabels, type Profile } from "@/shared/profiles";
import { isSecretKey, maskSecret } from "@/shared/schema";

type ProfileListProps = {
  profiles: Profile[];
  activeProfileId: string | null;
  onActivate: (profileId: string) => void;
  onEdit: (profileId: string) => void;
  onDelete: (profileId: string) => void;
};

function formatManagedValue(profile: Profile, key: (typeof managedEnvKeys)[number]) {
  const value = profile.env[key];

  if (!value) {
    return "Not set";
  }

  if (isSecretKey(key)) {
    return maskSecret(value, key);
  }

  return value;
}

export function ProfileList({
  profiles,
  activeProfileId,
  onActivate,
  onEdit,
  onDelete,
}: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <Card className="border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] shadow-none">
        <CardContent className="space-y-3 p-8">
          <h2 className="text-lg font-semibold text-[var(--app-text)]">No profiles yet</h2>
          <p className="max-w-2xl text-sm leading-6 text-[var(--app-text-muted)]">
            Create your first profile to manage Anthropic credentials and model aliases without
            editing Claude&apos;s settings file by hand.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {sortProfiles(profiles).map((profile) => {
        const isActive = profile.id === activeProfileId;

        return (
          <Card
            key={profile.id}
            className="border border-[var(--app-border)] bg-[var(--app-surface)] shadow-none"
          >
            <CardHeader className="flex flex-wrap items-start justify-between gap-3 p-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-[var(--app-text)]">{profile.name}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${
                      isActive
                        ? "border border-emerald-400/40 bg-emerald-400/12 text-emerald-300"
                        : "border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]"
                    }`}
                  >
                    {isActive ? "Active" : "Saved"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--app-text-muted)]">
                  Updated {new Date(profile.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardHeader>

            <CardContent className="grid gap-3 px-5 pb-5 pt-0 sm:grid-cols-2">
              {managedEnvKeys.map((key) => (
                <div
                  key={key}
                  className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-3"
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
                    {managedKeyLabels[key]}
                  </p>
                  <p className="mt-2 break-all text-sm text-[var(--app-text)]">
                    {formatManagedValue(profile, key)}
                  </p>
                </div>
              ))}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-3 p-5 pt-0">
              <Button
                variant={isActive ? "secondary" : "primary"}
                onPress={() => {
                  if (!isActive) {
                    onActivate(profile.id);
                  }
                }}
              >
                <span className="flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>{isActive ? "Applied" : "Activate"}</span>
                </span>
              </Button>
              <Button
                variant="secondary"
                onPress={() => {
                  onEdit(profile.id);
                }}
              >
                <span className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </span>
              </Button>
              <Button
                variant="danger-soft"
                onPress={() => {
                  onDelete(profile.id);
                }}
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </span>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
