import { create } from "zustand";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  img?: string | null;
};

type AuthStore = {
  user: User | null;
  status: "authenticated" | "loading" | "unauthenticated";
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStore["status"]) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  status: "loading",
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  clear: () => set({ user: null, status: "unauthenticated" }),
}));
