import { ipcMain } from "electron";

import { ipcChannels, type ProfileInput } from "../../src/shared/ipc";
import { bootstrapApp } from "../services/bootstrapService";
import { switchProfileInClaudeSettings } from "../services/claudeSettingsService";
import type { AppPaths } from "../services/paths";
import {
  createProfile,
  deleteProfile,
  getActiveProfileId,
  getProfileById,
  listProfiles,
  updateProfile,
} from "../services/profileService";

export function registerProfileIpcHandlers(paths: AppPaths): void {
  ipcMain.removeHandler(ipcChannels.bootstrap);
  ipcMain.removeHandler(ipcChannels.getProfiles);
  ipcMain.removeHandler(ipcChannels.getActiveProfileId);
  ipcMain.removeHandler(ipcChannels.createProfile);
  ipcMain.removeHandler(ipcChannels.updateProfile);
  ipcMain.removeHandler(ipcChannels.deleteProfile);
  ipcMain.removeHandler(ipcChannels.switchProfile);

  ipcMain.handle(ipcChannels.bootstrap, async () => bootstrapApp(paths));
  ipcMain.handle(ipcChannels.getProfiles, async () => listProfiles(paths));
  ipcMain.handle(ipcChannels.getActiveProfileId, async () => getActiveProfileId(paths));
  ipcMain.handle(ipcChannels.createProfile, async (_event, input: ProfileInput) =>
    createProfile(paths, input),
  );
  ipcMain.handle(
    ipcChannels.updateProfile,
    async (_event, profileId: string, input: ProfileInput) =>
      updateProfile(paths, profileId, input),
  );
  ipcMain.handle(ipcChannels.deleteProfile, async (_event, profileId: string) =>
    deleteProfile(paths, profileId),
  );
  ipcMain.handle(ipcChannels.switchProfile, async (_event, profileId: string) => {
    const profile = await getProfileById(paths, profileId);

    if (!profile) {
      throw new Error("Profile not found.");
    }

    return switchProfileInClaudeSettings(paths, profile);
  });
}
