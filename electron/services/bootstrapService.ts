import type { BootstrapResult } from "../../src/shared/ipc";
import { readClaudeSettingsSnapshot } from "./claudeSettingsService";
import type { AppPaths } from "./paths";
import { readPreferences } from "./preferencesService";
import { readAppState } from "./profileService";

export async function bootstrapApp(paths: AppPaths): Promise<BootstrapResult> {
  const existingState = await readAppState(paths);
  const preferences = await readPreferences(paths);

  return {
    profiles: existingState.profiles,
    activeProfileId: existingState.activeProfileId,
    settingsSnapshot: await readClaudeSettingsSnapshot(paths),
    preferences,
  };
}
