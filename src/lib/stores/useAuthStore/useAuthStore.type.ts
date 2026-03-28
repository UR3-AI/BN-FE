export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  clearTokens: () => void;
}

export type AuthStore = AuthState & AuthActions;
