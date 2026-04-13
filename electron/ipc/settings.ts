import { ipcMain } from "electron";

import { ipcChannels } from "../../src/shared/ipc";
import { restoreBackup } from "../services/backupService";
import { readClaudeSettingsSnapshot } from "../services/claudeSettingsService";
import type { AppPaths } from "../services/paths";

export function registerSettingsIpcHandlers(paths: AppPaths): void {
  ipcMain.removeHandler(ipcChannels.readClaudeSettingsSnapshot);
  ipcMain.removeHandler(ipcChannels.restoreBackup);

  ipcMain.handle(ipcChannels.readClaudeSettingsSnapshot, async () =>
    readClaudeSettingsSnapshot(paths),
  );
  ipcMain.handle(ipcChannels.restoreBackup, async (_event, backupId: string) =>
    restoreBackup(paths, backupId),
  );
}
