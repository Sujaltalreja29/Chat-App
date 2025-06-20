// store/useThemeStore.js - Only critical fix
import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: (() => {
    // 🔧 FIX: Added error handling for localStorage
    try {
      return localStorage.getItem("chat-theme") || "light";
    } catch (error) {
      console.error("Failed to load theme:", error);
      return "light";
    }
  })(),
  
  setTheme: (theme) => {
    // 🔧 FIX: Added error handling for localStorage and DOM
    try {
      localStorage.setItem("chat-theme", theme);
      document.documentElement.setAttribute('data-theme', theme);
      set({ theme });
    } catch (error) {
      console.error("Failed to set theme:", error);
      // Still update state even if localStorage fails
      set({ theme });
    }
  },
}));