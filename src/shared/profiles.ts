export const managedEnvKeys = [
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_AUTH_TOKEN",
  "ANTHROPIC_BASE_URL",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL",
  "ANTHROPIC_DEFAULT_SONNET_MODEL",
  "ANTHROPIC_DEFAULT_OPUS_MODEL",
] as const;

export const managedSecretKeys = ["ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN"] as const;

export const appStateSchemaVersion = 1 as const;

export type ManagedEnvKey = (typeof managedEnvKeys)[number];
export type ManagedSecretKey = (typeof managedSecretKeys)[number];

export type ManagedEnv = Partial<Record<ManagedEnvKey, string>>;

export type ProfileInput = {
  name: string;
  env: ManagedEnv;
};

export type Profile = ProfileInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type AppState = {
  schemaVersion: typeof appStateSchemaVersion;
  activeProfileId: string | null;
  profiles: Profile[];
};

export const managedKeyLabels: Record<ManagedEnvKey, string> = {
  ANTHROPIC_API_KEY: "API key",
  ANTHROPIC_AUTH_TOKEN: "Auth token",
  ANTHROPIC_BASE_URL: "Base URL",
  ANTHROPIC_DEFAULT_HAIKU_MODEL: "Default Haiku model",
  ANTHROPIC_DEFAULT_SONNET_MODEL: "Default Sonnet model",
  ANTHROPIC_DEFAULT_OPUS_MODEL: "Default Opus model",
};
