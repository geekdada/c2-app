import { Button, Card, CardContent, CardHeader } from "@heroui/react";
import { Check, Copy, MoonStar, RotateCcw, SunMedium } from "lucide-react";
import { useState } from "react";

import { useProfilesStore } from "@/app/store/profiles";
import { useUiStore } from "@/app/store/ui";
import { managedEnvKeys, managedKeyLabels } from "@/shared/profiles";
import { isSecretKey, maskSecret } from "@/shared/schema";

export function AppSettingsPage() {
  const settingsSnapshot = useProfilesStore((state) => state.settingsSnapshot);
  const refreshSettingsSnapshot = useProfilesStore((state) => state.refreshSettingsSnapshot);
  const restoreBackup = useProfilesStore((state) => state.restoreBackup);
  const isSaving = useProfilesStore((state) => state.isSaving);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const pushToast = useUiStore((state) => state.pushToast);
  const [copied, setCopied] = useState(false);

  const handleCopyPath = async () => {
    if (!settingsSnapshot) {
      return;
    }

    await navigator.clipboard.writeText(settingsSnapshot.path);
    setCopied(true);
    pushToast({
      tone: "success",
      title: "Copied settings path",
    });
    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--app-text-subtle)]">
          Diagnostics
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--app-text)]">
          C2 settings and Claude snapshot
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
          Check the live Claude settings file, inspect backups, and restore a previous snapshot when
          needed.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border border-[var(--app-border)] bg-[var(--app-surface)] shadow-none">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Claude settings file</h2>
              <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                {settingsSnapshot?.exists
                  ? "Live settings file found."
                  : "No Claude settings file exists yet."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onPress={() => {
                  void handleCopyPath();
                }}
              >
                <span className="flex items-center gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "Copied" : "Copy path"}</span>
                </span>
              </Button>
              <Button
                variant="secondary"
                onPress={() => {
                  void refreshSettingsSnapshot();
                }}
              >
                Refresh snapshot
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5 pt-0">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--app-text-subtle)]">
                Path
              </p>
              <p className="mt-2 break-all text-sm text-[var(--app-text)]">
                {settingsSnapshot?.path ?? "Unavailable"}
              </p>
            </div>

            {settingsSnapshot?.error ? (
              <div className="rounded-2xl border border-rose-400/35 bg-rose-400/10 p-4 text-sm leading-6 text-rose-100">
                {settingsSnapshot.error}
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              {managedEnvKeys.map((key) => {
                const value = settingsSnapshot?.managedEnv[key];

                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--app-text-subtle)]">
                      {managedKeyLabels[key]}
                    </p>
                    <p className="mt-2 break-all text-sm text-[var(--app-text)]">
                      {value ? (isSecretKey(key) ? maskSecret(value, key) : value) : "Not set"}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--app-text-subtle)]">
                Unmanaged Claude keys
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {settingsSnapshot?.unmanagedKeys.length ? (
                  settingsSnapshot.unmanagedKeys.map((key) => (
                    <span
                      key={key}
                      className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1 text-xs text-[var(--app-text-muted)]"
                    >
                      {key}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[var(--app-text-muted)]">
                    No additional env keys detected.
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border border-[var(--app-border)] bg-[var(--app-surface)] shadow-none">
            <CardHeader className="p-5 pb-0">
              <div>
                <h2 className="text-lg font-semibold text-[var(--app-text)]">Appearance</h2>
                <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                  Toggle between the compact dark and light surfaces.
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-row gap-3 p-5">
              <Button variant="secondary" onPress={toggleTheme}>
                <span className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <SunMedium className="h-4 w-4" />
                  ) : (
                    <MoonStar className="h-4 w-4" />
                  )}
                  <span>Switch to {theme === "dark" ? "light" : "dark"}</span>
                </span>
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[var(--app-border)] bg-[var(--app-surface)] shadow-none">
            <CardHeader className="p-5 pb-0">
              <div>
                <h2 className="text-lg font-semibold text-[var(--app-text)]">Backups</h2>
                <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                  Every successful switch snapshots the original Claude settings first.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {settingsSnapshot?.backups.length ? (
                settingsSnapshot.backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
                  >
                    <p className="text-sm font-medium text-[var(--app-text)]">
                      {new Date(backup.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 break-all text-xs text-[var(--app-text-muted)]">
                      {backup.id}
                    </p>
                    <Button
                      className="mt-3"
                      isDisabled={isSaving}
                      variant="secondary"
                      onPress={() => {
                        void restoreBackup(backup.id).then(() => {
                          pushToast({
                            tone: "success",
                            title: "Backup restored",
                            description:
                              "Claude settings were replaced with the selected snapshot.",
                          });
                        });
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        <span>{isSaving ? "Restoring…" : "Restore"}</span>
                      </span>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4 text-sm leading-6 text-[var(--app-text-muted)]">
                  No backups yet. Activate a profile to create the first snapshot.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
