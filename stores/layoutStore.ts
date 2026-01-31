"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LayoutState {
  layoutMode: "split" | "tab";
  setLayoutMode: (mode: "split" | "tab") => void;
  toggleLayout: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      layoutMode: "split",
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      toggleLayout: () =>
        set({ layoutMode: get().layoutMode === "split" ? "tab" : "split" }),
    }),
    {
      name: "layout-mode-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
