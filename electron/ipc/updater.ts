import { ipcMain, type BrowserWindow } from "electron";

import { ipcChannels } from "../../src/shared/ipc";
import { checkForUpdates, initAutoUpdater, openReleasePage } from "../services/updaterService";

export function registerUpdaterIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.removeHandler(ipcChannels.checkForUpdate);
  ipcMain.removeHandler(ipcChannels.openReleasePage);

  ipcMain.handle(ipcChannels.checkForUpdate, () => {
    void checkForUpdates();
  });

  ipcMain.handle(ipcChannels.openReleasePage, () => {
    openReleasePage();
  });

  initAutoUpdater(mainWindow);
}
