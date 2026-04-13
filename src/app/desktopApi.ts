import type { DesktopApi } from "@/shared/ipc";

export function getDesktopApi(): DesktopApi {
  const api = window.api ?? window.__PROFILE_MANAGER_MOCK_API__;

  if (!api) {
    throw new Error(
      "Electron bridge unavailable. Open the app through Electron or inject a mock DesktopApi for tests.",
    );
  }

  return api;
}
