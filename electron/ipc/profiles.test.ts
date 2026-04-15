// @vitest-environment node

import os from "node:os";
import path from "node:path";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const electronMocks = vi.hoisted(() => {
  const handlers = new Map<string, (_event: unknown, ...args: unknown[]) => unknown>();

  return {
    handlers,
    removeHandler: vi.fn((channel: string) => {
      handlers.delete(channel);
    }),
    handle: vi.fn((channel: string, handler: (_event: unknown, ...args: unknown[]) => unknown) => {
      handlers.set(channel, handler);
    }),
  };
});

vi.mock("electron", () => ({
  ipcMain: {
    removeHandler: electronMocks.removeHandler,
    handle: electronMocks.handle,
  },
}));

import { ipcChannels } from "../../src/shared/ipc";
import { listBackups } from "../services/backupService";
import { createAppPaths } from "../services/paths";
import { readAppState, writeAppState } from "../services/profileService";
import { registerProfileIpcHandlers } from "./profiles";

async function createTestPaths() {
  const root = await mkdtemp(path.join(os.tmpdir(), "claude-profile-manager-"));
  const home = path.join(root, "home");

  await mkdir(path.join(home, ".config", "c2-app"), { recursive: true });
  await mkdir(path.join(home, ".claude"), { recursive: true });

  return createAppPaths(home);
}

describe("registerProfileIpcHandlers", () => {
  beforeEach(() => {
    electronMocks.handlers.clear();
    electronMocks.handle.mockClear();
    electronMocks.removeHandler.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes active profile edits into Claude settings", async () => {
    const paths = await createTestPaths();
    const profile = {
      id: "profile-1",
      name: "Work",
      env: {
        ANTHROPIC_API_KEY: "key-current",
        ANTHROPIC_BASE_URL: "https://old.example.com",
      },
      createdAt: "2026-04-13T00:00:00.000Z",
      updatedAt: "2026-04-13T00:00:00.000Z",
    };

    await writeAppState(paths, {
      schemaVersion: 1,
      activeProfileId: profile.id,
      profiles: [profile],
    });

    await writeFile(
      paths.claudeSettingsFile,
      JSON.stringify(
        {
          env: {
            ANTHROPIC_API_KEY: "key-current",
            ANTHROPIC_BASE_URL: "https://old.example.com",
            CUSTOM_FLAG: "keep-me",
          },
          permissions: {
            allow: ["Read", "Write"],
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    registerProfileIpcHandlers(paths);

    const updateHandler = electronMocks.handlers.get(ipcChannels.updateProfile);

    if (!updateHandler) {
      throw new Error("Update profile handler was not registered.");
    }

    await updateHandler({}, profile.id, {
      name: "Work Updated",
      env: {
        ANTHROPIC_AUTH_TOKEN: "auth-next",
        CLAUDE_CODE_DISABLE_ATTACHMENTS: "1",
      },
    });

    const appState = await readAppState(paths);
    const persistedSettings = JSON.parse(await readFile(paths.claudeSettingsFile, "utf8")) as {
      env: Record<string, string>;
      permissions: Record<string, string[]>;
    };

    expect(appState.activeProfileId).toBe(profile.id);
    expect(appState.profiles).toEqual([
      {
        ...profile,
        name: "Work Updated",
        env: {
          ANTHROPIC_AUTH_TOKEN: "auth-next",
          CLAUDE_CODE_DISABLE_ATTACHMENTS: "1",
        },
        updatedAt: appState.profiles[0]?.updatedAt,
      },
    ]);
    expect(persistedSettings).toEqual({
      env: {
        CUSTOM_FLAG: "keep-me",
        ANTHROPIC_AUTH_TOKEN: "auth-next",
        CLAUDE_CODE_DISABLE_ATTACHMENTS: "1",
      },
      permissions: {
        allow: ["Read", "Write"],
      },
    });
    expect(await listBackups(paths)).toHaveLength(1);
  });
});
