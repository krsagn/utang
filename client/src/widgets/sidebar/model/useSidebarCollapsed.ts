import { create } from "zustand";

interface SidebarCollapsedState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

export const useSidebarCollapsed = create<SidebarCollapsedState>()((set) => ({
  collapsed: false,
  setCollapsed: (collapsed) => set({ collapsed }),
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
}));
