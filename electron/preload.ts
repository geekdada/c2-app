import { contextBridge, ipcRenderer } from "electron";

import { ipcChannels, type DesktopApi, type ProfileInput } from "../src/shared/ipc";

const api: DesktopApi = {
  bootstrap: () => ipcRenderer.invoke(ipcChannels.bootstrap),
  getProfiles: () => ipcRenderer.invoke(ipcChannels.getProfiles),
  getActiveProfileId: () => ipcRenderer.invoke(ipcChannels.getActiveProfileId),
  createProfile: (input: ProfileInput) => ipcRenderer.invoke(ipcChannels.createProfile, input),
  updateProfile: (profileId: string, input: ProfileInput) =>
    ipcRenderer.invoke(ipcChannels.updateProfile, profileId, input),
  deleteProfile: (profileId: string) => ipcRenderer.invoke(ipcChannels.deleteProfile, profileId),
  switchProfile: (profileId: string) => ipcRenderer.invoke(ipcChannels.switchProfile, profileId),
  readClaudeSettingsSnapshot: () => ipcRenderer.invoke(ipcChannels.readClaudeSettingsSnapshot),
  restoreBackup: (backupId: string) => ipcRenderer.invoke(ipcChannels.restoreBackup, backupId),
};

contextBridge.exposeInMainWorld("api", api);
