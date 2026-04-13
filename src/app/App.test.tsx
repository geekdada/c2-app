import { render, screen, waitFor } from "@testing-library/react";
import { HashRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import App from "./App";
import { AppProviders } from "./providers";
import { useProfilesStore } from "./store/profiles";
import { useUiStore } from "./store/ui";
import { createMockDesktopApi } from "@/testing/mockDesktopApi";

function resetStores() {
  useProfilesStore.setState({
    profiles: [],
    activeProfileId: null,
    isLoading: true,
    isSaving: false,
    dirtyProfileId: null,
    importResult: null,
    settingsSnapshot: null,
    error: null,
  });

  useUiStore.setState({
    currentSidebarKey: "profiles",
    theme: "dark",
    hasCompletedOnboarding: false,
    modals: {
      switchProfileId: null,
      deleteProfileId: null,
    },
    toasts: [],
  });
}

describe("App", () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    delete window.__PROFILE_MANAGER_MOCK_API__;
  });

  it("shows onboarding when no profiles exist", async () => {
    window.__PROFILE_MANAGER_MOCK_API__ = createMockDesktopApi();

    render(
      <HashRouter>
        <AppProviders>
          <App />
        </AppProviders>
      </HashRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Create your first C2 profile")).toBeInTheDocument();
    });
  });
});
