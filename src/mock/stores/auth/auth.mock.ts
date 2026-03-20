import type {
  AuthState,
} from "@lib/stores/useAuthStore/useAuthStore.type";

export const mockAuthenticatedState: AuthState = {
  accessToken: "mock-access-token-xyz",
  refreshToken: "mock-refresh-token-abc",
  expiresAt: Date.now() + 3600 * 1000,
  isAuthenticated: true,
};

export const mockUnauthenticatedState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  isAuthenticated: false,
};

export const mockExpiredState: AuthState = {
  accessToken: "mock-expired-access-token",
  refreshToken: "mock-refresh-token-abc",
  expiresAt: Date.now() - 1000,
  isAuthenticated: true,
};
