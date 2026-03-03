import { create } from "zustand";

export const usePageStore = create((set) => ({
  page: "login", 
  goToLogin: () => set({ page: "login" }),
  goToRegister: () => set({ page: "register" }),
}));
