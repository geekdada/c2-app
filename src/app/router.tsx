import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { AppSettingsPage } from "@/pages/AppSettingsPage";
import { HomePage } from "@/pages/HomePage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { ProfileEditorPage } from "@/pages/ProfileEditorPage";

import { useProfilesStore } from "./store/profiles";

function RouteCoordinator() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoading = useProfilesStore((state) => state.isLoading);
  const profilesCount = useProfilesStore((state) => state.profiles.length);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (profilesCount === 0 && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
      return;
    }

    if (profilesCount > 0 && location.pathname === "/onboarding") {
      navigate("/", { replace: true });
    }
  }, [isLoading, location.pathname, navigate, profilesCount]);

  return null;
}

export function AppRouter() {
  return (
    <>
      <RouteCoordinator />
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/profiles/new" element={<ProfileEditorPage />} />
          <Route path="/profiles/:id" element={<ProfileEditorPage />} />
          <Route path="/settings" element={<AppSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </>
  );
}
