import { describe, expect, it } from "vitest";

import { diffManagedEnv, normalizeManagedEnv, validateProfileInput } from "./schema";

describe("schema helpers", () => {
  it("trims and removes empty managed env values", () => {
    expect(
      normalizeManagedEnv({
        ANTHROPIC_API_KEY: "  key-123  ",
        ANTHROPIC_AUTH_TOKEN: "   ",
        ANTHROPIC_BASE_URL: "\nhttps://example.com  ",
      }),
    ).toEqual({
      ANTHROPIC_API_KEY: "key-123",
      ANTHROPIC_BASE_URL: "https://example.com",
    });
  });

  it("requires one credential when validating a profile", () => {
    expect(() =>
      validateProfileInput({
        name: "Empty",
        env: {},
      }),
    ).toThrowError(/API key or auth token/i);
  });

  it("detects added, updated, and removed managed env keys", () => {
    expect(
      diffManagedEnv(
        {
          ANTHROPIC_API_KEY: "old",
          ANTHROPIC_DEFAULT_SONNET_MODEL: "claude-old",
        },
        {
          ANTHROPIC_AUTH_TOKEN: "new-token",
          ANTHROPIC_DEFAULT_SONNET_MODEL: "claude-next",
        },
      ),
    ).toEqual({
      added: ["ANTHROPIC_AUTH_TOKEN"],
      removed: ["ANTHROPIC_API_KEY"],
      updated: ["ANTHROPIC_DEFAULT_SONNET_MODEL"],
    });
  });
});
