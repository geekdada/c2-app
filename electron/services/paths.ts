import path from "node:path";

export type AppPaths = {
  userDataDir: string;
  profilesFile: string;
  preferencesFile: string;
  backupsDir: string;
  claudeDirectory: string;
  claudeSettingsFile: string;
};

export function createAppPaths(homeDir: string): AppPaths {
  const userDataDir = path.join(homeDir, ".config", "c2-app");
  const claudeDirectory = path.join(homeDir, ".claude");

  return {
    userDataDir,
    profilesFile: path.join(userDataDir, "profiles.json"),
    preferencesFile: path.join(userDataDir, "preferences.json"),
    backupsDir: path.join(userDataDir, "backups"),
    claudeDirectory,
    claudeSettingsFile: path.join(claudeDirectory, "settings.json"),
  };
}
