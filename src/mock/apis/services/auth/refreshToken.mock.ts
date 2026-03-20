import type { UR3Token } from "@lib/types";

export const mockRefreshTokenRequest = {
  refresh_token: "mock-refresh-token-abc",
};

export const mockRefreshTokenResponse: UR3Token = {
  access_token: "mock-refreshed-access-token",
  refresh_token: "mock-refreshed-refresh-token",
  token_type: "Bearer",
  expires_in: 3600,
};
