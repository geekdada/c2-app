import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
};

type ThemeMode = "dark" | "light";

type UiState = {
  currentSidebarKey: string;
  theme: ThemeMode;
  hasCompletedOnboarding: boolean;
  modals: {
    switchProfileId: string | null;
    deleteProfileId: string | null;
  };
  toasts: ToastItem[];
  setCurrentSidebarKey: (key: string) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  openSwitchModal: (profileId: string) => void;
  closeSwitchModal: () => void;
  openDeleteModal: (profileId: string) => void;
  closeDeleteModal: () => void;
  pushToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (toastId: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  currentSidebarKey: "profiles",
  theme: "dark",
  hasCompletedOnboarding: false,
  modals: {
    switchProfileId: null,
    deleteProfileId: null,
  },
  toasts: [],
  setCurrentSidebarKey: (key) => {
    set({
      currentSidebarKey: key,
    });
  },
  setTheme: (theme) => {
    set({
      theme,
    });
  },
  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === "dark" ? "light" : "dark",
    }));
  },
  setHasCompletedOnboarding: (value) => {
    set({
      hasCompletedOnboarding: value,
    });
  },
  openSwitchModal: (profileId) => {
    set((state) => ({
      modals: {
        ...state.modals,
        switchProfileId: profileId,
      },
    }));
  },
  closeSwitchModal: () => {
    set((state) => ({
      modals: {
        ...state.modals,
        switchProfileId: null,
      },
    }));
  },
  openDeleteModal: (profileId) => {
    set((state) => ({
      modals: {
        ...state.modals,
        deleteProfileId: profileId,
      },
    }));
  },
  closeDeleteModal: () => {
    set((state) => ({
      modals: {
        ...state.modals,
        deleteProfileId: null,
      },
    }));
  },
  pushToast: (toast) => {
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: crypto.randomUUID(),
          ...toast,
        },
      ],
    }));
  },
  dismissToast: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    }));
  },
}));
