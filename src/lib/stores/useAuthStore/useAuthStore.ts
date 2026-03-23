import type { AuthStore } from "./useAuthStore.type";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken, expiresIn) => {
        set({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
          isAuthenticated: true,
        });
      },

      clearTokens: () => {
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
        });
      },
    }),

    {
      name: "auth-storage",

      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
      }),

      onRehydrateStorage: () => state => {
        if (state) {
          state.isAuthenticated = state.refreshToken !== null;
        }
      },
    },
  ),
);

export default useAuthStore;
