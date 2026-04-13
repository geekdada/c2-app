import { useEffect, type PropsWithChildren } from "react";

import { useUiStore } from "./store/ui";

export function AppProviders({ children }: PropsWithChildren) {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return children;
}
