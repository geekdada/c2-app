import { app, net, shell, type BrowserWindow } from "electron";

import { ipcChannels, type UpdateStatus } from "../../src/shared/ipc";

const REPO = "geekdada/c2-app";
const CHECK_INTERVAL_MS = 10 * 60 * 1_000;

let mainWindow: BrowserWindow | null = null;
let latestReleaseUrl: string | null = null;

function send(status: UpdateStatus): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(ipcChannels.onUpdateStatus, status);
  }
}

function compareVersions(current: string, latest: string): number {
  const parse = (v: string) => v.replace(/^v/, "").split(".").map(Number);
  const a = parse(current);
  const b = parse(latest);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (b[i] ?? 0) - (a[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function fetchLatestRelease(): Promise<{ tag: string; url: string }> {
  return new Promise((resolve, reject) => {
    const request = net.request({
      method: "GET",
      url: `https://api.github.com/repos/${REPO}/releases/latest`,
    });
    request.setHeader("Accept", "application/vnd.github.v3+json");
    request.setHeader("User-Agent", `C2/${app.getVersion()}`);

    let body = "";
    request.on("response", (response) => {
      response.on("data", (chunk) => {
        body += chunk.toString();
      });
      response.on("end", () => {
        if (response.statusCode !== 200) {
          reject(new Error(`GitHub API returned ${response.statusCode}`));
          return;
        }
        try {
          const data = JSON.parse(body);
          resolve({ tag: data.tag_name, url: data.html_url });
        } catch {
          reject(new Error("Failed to parse GitHub release response"));
        }
      });
    });
    request.on("error", reject);
    request.end();
  });
}

export async function checkForUpdates(): Promise<void> {
  send({ state: "checking" });
  try {
    const { tag, url } = await fetchLatestRelease();
    const current = app.getVersion();
    if (compareVersions(current, tag) > 0) {
      latestReleaseUrl = url;
      send({ state: "available", version: tag.replace(/^v/, ""), url });
    } else {
      send({ state: "not-available" });
    }
  } catch (err) {
    send({
      state: "error",
      message: err instanceof Error ? err.message : "Update check failed",
    });
  }
}

export function openReleasePage(): void {
  if (latestReleaseUrl) {
    void shell.openExternal(latestReleaseUrl);
  }
}

export function initAutoUpdater(window: BrowserWindow): void {
  mainWindow = window;
  setTimeout(() => void checkForUpdates(), 3_000);
  setInterval(() => void checkForUpdates(), CHECK_INTERVAL_MS);
}
