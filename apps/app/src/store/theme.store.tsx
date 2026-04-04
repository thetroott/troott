// theme.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const getSystemTheme = (): "light" | "dark" =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemTheme() : theme;

  root.classList.remove("light", "dark");
  root.classList.add(resolved);
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      get resolvedTheme() {
        return get().theme === "system"
          ? getSystemTheme()
          : (get().theme as "light" | "dark");
      },
    }),
    { name: "theme" }
  )
);

// init theme on app load
export const initTheme = () => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('theme');
    let theme;
    if (raw) {
      try {
        const json = JSON.parse(raw);
        theme = json?.theme ?? json?.state?.theme ?? raw;
      } catch { theme = raw; }
    }
    applyTheme(theme ?? useThemeStore.getState().theme);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (useThemeStore.getState().theme === "system") applyTheme("system");
    });
  } catch (e) {}
};

