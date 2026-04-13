import { ipcMain } from "electron";

import { ipcChannels } from "../../src/shared/ipc";
import type { Preferences } from "../../src/shared/preferences";
import type { AppPaths } from "../services/paths";
import { readPreferences, writePreferences } from "../services/preferencesService";

export function registerPreferencesIpcHandlers(paths: AppPaths): void {
  ipcMain.removeHandler(ipcChannels.getPreferences);
  ipcMain.removeHandler(ipcChannels.savePreferences);

  ipcMain.handle(ipcChannels.getPreferences, async () => readPreferences(paths));
  ipcMain.handle(ipcChannels.savePreferences, async (_event, prefs: Preferences) =>
    writePreferences(paths, prefs),
  );
}
