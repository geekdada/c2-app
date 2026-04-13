import { Button, Card, CardContent } from "@heroui/react";
import { Eye, EyeOff, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ZodError } from "zod";

import {
  managedEnvKeys,
  managedKeyLabels,
  type ManagedEnvKey,
  type Profile,
  type ProfileInput,
} from "@/shared/profiles";
import { normalizeProfileInput, validateProfileInput } from "@/shared/schema";

type ProfileFormProps = {
  mode: "create" | "edit";
  profile?: Profile;
  isSaving?: boolean;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onSubmit: (input: ProfileInput) => Promise<void>;
};

type FormValues = {
  name: string;
  env: Record<ManagedEnvKey, string>;
};

const emptyEnv = Object.fromEntries(managedEnvKeys.map((key) => [key, ""])) as Record<
  ManagedEnvKey,
  string
>;

const fieldDescriptions: Partial<Record<ManagedEnvKey, string>> = {
  ANTHROPIC_API_KEY: "Used for direct API authentication.",
  ANTHROPIC_AUTH_TOKEN: "Optional Claude auth token. Either this or API key is required.",
  ANTHROPIC_BASE_URL: "Optional custom API base URL.",
  ANTHROPIC_DEFAULT_HAIKU_MODEL: "Optional default alias for Claude Haiku.",
  ANTHROPIC_DEFAULT_SONNET_MODEL: "Optional default alias for Claude Sonnet.",
  ANTHROPIC_DEFAULT_OPUS_MODEL: "Optional default alias for Claude Opus.",
};

function toFormValues(profile?: Profile): FormValues {
  return {
    name: profile?.name ?? "",
    env: {
      ...emptyEnv,
      ...profile?.env,
    },
  };
}

function getFieldType(key: ManagedEnvKey, showSecrets: boolean): string {
  if (key === "ANTHROPIC_API_KEY" || key === "ANTHROPIC_AUTH_TOKEN") {
    return showSecrets ? "text" : "password";
  }

  if (key === "ANTHROPIC_BASE_URL") {
    return "url";
  }

  return "text";
}

export function ProfileForm({
  mode,
  profile,
  isSaving = false,
  onCancel,
  onDirtyChange,
  onSubmit,
}: ProfileFormProps) {
  const initialValues = useMemo(() => toFormValues(profile), [profile]);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [showSecrets, setShowSecrets] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"name" | ManagedEnvKey, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const inputClassName =
    "mt-2 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-subtle)] focus:border-[var(--app-border-strong)]";

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setGeneralError(null);
  }, [initialValues]);

  const isDirty = useMemo(() => {
    const current = normalizeProfileInput(values);
    const baseline = normalizeProfileInput(initialValues);

    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [initialValues, values]);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = async () => {
    setErrors({});
    setGeneralError(null);

    try {
      const payload = validateProfileInput(values);

      await onSubmit(payload);
    } catch (error) {
      if (error instanceof ZodError) {
        const nextErrors = error.issues.reduce<Partial<Record<"name" | ManagedEnvKey, string>>>(
          (allErrors, issue) => {
            const key = issue.path[0];

            if (typeof key === "string") {
              allErrors[key as "name" | ManagedEnvKey] = issue.message;
            }

            return allErrors;
          },
          {},
        );

        setErrors(nextErrors);

        return;
      }

      setGeneralError(error instanceof Error ? error.message : "Failed to save profile.");
    }
  };

  return (
    <Card className="border border-[var(--app-border)] bg-[var(--app-surface)] shadow-none">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--app-text-subtle)]">
              {mode === "create" ? "New profile" : "Edit profile"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">
              {mode === "create" ? "Create a profile" : `Edit ${profile?.name ?? "profile"}`}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-muted)]">
              Only the six managed Anthropic keys are stored here. Empty values are removed on
              activation.
            </p>
          </div>
          <Button
            variant="secondary"
            onPress={() => {
              setShowSecrets((current) => !current);
            }}
          >
            <span className="flex items-center gap-2">
              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showSecrets ? "Hide secrets" : "Show secrets"}</span>
            </span>
          </Button>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-[var(--app-text)]">Profile name</span>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">
            Use a concise label such as Work, Personal, or Staging.
          </p>
          <input
            className={inputClassName}
            type="text"
            value={values.name}
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                name: event.target.value,
              }));
            }}
          />
          {errors.name ? <p className="mt-2 text-sm text-rose-300">{errors.name}</p> : null}
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          {managedEnvKeys.map((key) => (
            <label key={key} className="block">
              <span className="text-sm font-medium text-[var(--app-text)]">
                {managedKeyLabels[key]}
              </span>
              {fieldDescriptions[key] ? (
                <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                  {fieldDescriptions[key]}
                </p>
              ) : null}
              <input
                className={inputClassName}
                type={getFieldType(key, showSecrets)}
                value={values.env[key]}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    env: {
                      ...current.env,
                      [key]: event.target.value,
                    },
                  }));
                }}
              />
              {errors[key] ? <p className="mt-2 text-sm text-rose-300">{errors[key]}</p> : null}
            </label>
          ))}
        </div>

        {generalError ? (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {generalError}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onPress={onCancel}>
            Cancel
          </Button>
          <Button
            isDisabled={isSaving}
            variant="primary"
            onPress={() => {
              void handleSave();
            }}
          >
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span>
                {isSaving ? "Saving…" : mode === "create" ? "Create profile" : "Save changes"}
              </span>
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
