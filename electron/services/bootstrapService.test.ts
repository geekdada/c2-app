// @vitest-environment node

import os from "node:os";
import path from "node:path";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { bootstrapApp } from "./bootstrapService";
import { createAppPaths } from "./paths";

async function createTestPaths() {
  const root = await mkdtemp(path.join(os.tmpdir(), "claude-profile-manager-"));
  const home = path.join(root, "home");

  await mkdir(path.join(home, ".config", "c2-app"), { recursive: true });
  await mkdir(path.join(home, ".claude"), { recursive: true });

  return {
    root,
    paths: createAppPaths(home),
  };
}

describe("bootstrapApp", () => {
  it("returns empty profiles for a fresh install with credentials in settings", async () => {
    const { paths } = await createTestPaths();

    await writeFile(
      paths.claudeSettingsFile,
      JSON.stringify(
        {
          env: {
            ANTHROPIC_API_KEY: " sk-imported-key ",
            ANTHROPIC_BASE_URL: "https://api.example.com",
            CLAUDE_CODE_DISABLE_1M_CONTEXT: "1",
            CLAUDE_CODE_DISABLE_ATTACHMENTS: "1",
            CUSTOM_FLAG: "leave-me-alone",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await bootstrapApp(paths);

    expect(result.profiles).toHaveLength(0);
    expect(result.activeProfileId).toBeNull();
    expect(result.settingsSnapshot.managedEnv).toEqual({
      ANTHROPIC_API_KEY: "sk-imported-key",
      ANTHROPIC_BASE_URL: "https://api.example.com",
      CLAUDE_CODE_DISABLE_1M_CONTEXT: "1",
      CLAUDE_CODE_DISABLE_ATTACHMENTS: "1",
    });
  });

  it("returns empty profiles when no credentials are present", async () => {
    const { paths } = await createTestPaths();

    await writeFile(
      paths.claudeSettingsFile,
      JSON.stringify(
        {
          env: {
            ANTHROPIC_BASE_URL: "https://api.example.com",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await bootstrapApp(paths);

    expect(result.profiles).toHaveLength(0);
    expect(result.activeProfileId).toBeNull();
  });
});
