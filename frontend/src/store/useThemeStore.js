// store/useThemeStore.js
import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "light",
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
}));