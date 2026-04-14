import { Button, Card, CardContent } from "@heroui/react";
import { Download, Plus, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useProfilesStore } from "@/app/store/profiles";
import { useUiStore } from "@/app/store/ui";
import { BrandBadge } from "@/components/layout/BrandBadge";
import { hasCredential } from "@/shared/schema";

export function OnboardingPage() {
  const navigate = useNavigate();
  const profiles = useProfilesStore((state) => state.profiles);
  const settingsSnapshot = useProfilesStore((state) => state.settingsSnapshot);
  const createProfile = useProfilesStore((state) => state.createProfile);
  const isSaving = useProfilesStore((state) => state.isSaving);
  const setHasCompletedOnboarding = useUiStore((state) => state.setHasCompletedOnboarding);
  const showOnboarding = useUiStore((state) => state.showOnboarding);
  const pushToast = useUiStore((state) => state.pushToast);

  const hasExistingCredentials = hasCredential(settingsSnapshot?.managedEnv ?? {});

  useEffect(() => {
    setHasCompletedOnboarding(false);
  }, [setHasCompletedOnboarding]);

  useEffect(() => {
    if (profiles.length > 0 && !showOnboarding) {
      setHasCompletedOnboarding(true);
      navigate("/", { replace: true });
    }
  }, [navigate, profiles.length, setHasCompletedOnboarding, showOnboarding]);

  return (
    <div className="mx-auto flex h-full max-w-5xl items-center justify-center px-4 py-8">
      <Card className="w-full border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[0_24px_60px_rgba(0,0,0,0.26)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="space-y-3">
            <BrandBadge size="lg" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--app-text-subtle)]">
                Welcome to C2
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[var(--app-text)]">
                {hasExistingCredentials
                  ? "Create a profile from existing credentials"
                  : "Create your first C2 profile"}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
                {hasExistingCredentials ? (
                  <>
                    Existing credentials were found in{" "}
                    <code className="rounded bg-[var(--app-surface-muted)] px-1.5 py-0.5 font-mono text-xs">
                      ~/.claude/settings.json
                    </code>
                    . Import them into a new profile, or create one from scratch.
                  </>
                ) : (
                  <>
                    No Claude Code credentials were found in{" "}
                    <code className="rounded bg-[var(--app-surface-muted)] px-1.5 py-0.5 font-mono text-xs">
                      ~/.claude/settings.json
                    </code>
                    . Create a profile to manage your credentials and activate it whenever you want
                    to rewrite Claude settings safely.
                  </>
                )}
              </p>
            </div>
          </div>

          {settingsSnapshot?.error ? (
            <div className="rounded-lg border border-amber-400/35 bg-amber-400/10 p-3 text-sm text-amber-100">
              <div className="flex items-start gap-3">
                <TriangleAlert className="mt-1 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Claude settings need attention</p>
                  <p className="mt-1 leading-6">{settingsSnapshot.error}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Only what matters to a profile is managed",
              "Unmanaged Claude environment variables stay preserved.",
              "Your settings are backed up.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border text-balance border-[var(--app-border)] bg-[var(--app-surface-muted)] p-3 text-sm leading-5 text-[var(--app-text-muted)]"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {hasExistingCredentials ? (
              <Button
                variant="primary"
                isDisabled={isSaving}
                onPress={() => {
                  void createProfile({
                    name: "Imported profile",
                    env: settingsSnapshot!.managedEnv,
                  }).then((profile) => {
                    pushToast({
                      tone: "success",
                      title: `Created ${profile.name}`,
                      description: "Imported credentials from your existing Claude settings.",
                    });
                    navigate("/");
                  });
                }}
              >
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>{isSaving ? "Importing…" : "Import existing credentials"}</span>
                </span>
              </Button>
            ) : null}
            <Button
              variant={hasExistingCredentials ? "secondary" : "primary"}
              onPress={() => {
                navigate("/profiles/new");
              }}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Create from scratch</span>
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
