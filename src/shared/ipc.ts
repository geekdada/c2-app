import type { Preferences } from "./preferences";
import type { ManagedEnv, Profile, ProfileInput } from "./profiles";

export const ipcChannels = {
  bootstrap: "profiles:bootstrap",
  getProfiles: "profiles:getProfiles",
  getActiveProfileId: "profiles:getActiveProfileId",
  createProfile: "profiles:create",
  updateProfile: "profiles:update",
  deleteProfile: "profiles:delete",
  switchProfile: "profiles:switch",
  readClaudeSettingsSnapshot: "settings:readSnapshot",
  restoreBackup: "settings:restoreBackup",
  getPreferences: "preferences:get",
  savePreferences: "preferences:save",
} as const;

export type BackupEntry = {
  id: string;
  createdAt: string;
};

export type ClaudeSettingsSnapshot = {
  path: string;
  exists: boolean;
  managedEnv: ManagedEnv;
  unmanagedKeys: string[];
  hasModelOverride: boolean;
  backups: BackupEntry[];
  error: string | null;
};

export type BootstrapResult = {
  profiles: Profile[];
  activeProfileId: string | null;
  settingsSnapshot: ClaudeSettingsSnapshot;
  preferences: Preferences;
};

export type SwitchResult = {
  activeProfileId: string;
  backupId: string | null;
  snapshot: ClaudeSettingsSnapshot;
};

export interface DesktopApi {
  bootstrap(): Promise<BootstrapResult>;
  getProfiles(): Promise<Profile[]>;
  getActiveProfileId(): Promise<string | null>;
  createProfile(input: ProfileInput): Promise<Profile>;
  updateProfile(id: string, input: ProfileInput): Promise<Profile>;
  deleteProfile(id: string): Promise<void>;
  switchProfile(id: string): Promise<SwitchResult>;
  readClaudeSettingsSnapshot(): Promise<ClaudeSettingsSnapshot>;
  restoreBackup(backupId: string): Promise<void>;
  getPreferences(): Promise<Preferences>;
  savePreferences(prefs: Preferences): Promise<void>;
}

export type { Preferences, ProfileInput };
