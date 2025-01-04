import { create } from "zustand";
import { Theme } from "../utils/contracts";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem("theme") as Theme) || Theme.LIGHT,
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      localStorage.setItem("theme", newTheme);
      const root = window.document.documentElement;

      if (newTheme === Theme.DARK) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      return { theme: newTheme };
    }),
}));

export default useThemeStore;
