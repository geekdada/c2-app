import path from "node:path";

export type AppPaths = {
  userDataDir: string;
  profilesFile: string;
  backupsDir: string;
  claudeDirectory: string;
  claudeSettingsFile: string;
};

export function createAppPaths(userDataDir: string, homeDir: string): AppPaths {
  const claudeDirectory = path.join(homeDir, ".claude");

  return {
    userDataDir,
    profilesFile: path.join(userDataDir, "profiles.json"),
    backupsDir: path.join(userDataDir, "backups"),
    claudeDirectory,
    claudeSettingsFile: path.join(claudeDirectory, "settings.json"),
  };
}
