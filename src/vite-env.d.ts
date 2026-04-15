/// <reference types="vite/client" />

import type { DesktopApi } from "@/shared/ipc";

declare global {
  const __APP_VERSION__: string;
  interface Window {
    api?: DesktopApi;
    __PROFILE_MANAGER_MOCK_API__?: DesktopApi;
  }
}

export {};
