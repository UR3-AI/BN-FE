import type {
  UseLoginRequest,
  UseLoginResponse,
} from "@lib/apis/mutations/auth/useLoginMutation/useLoginMutation.type";

export const mockLoginRequest: UseLoginRequest = {
  email: "test@example.com",
  password: "password123!",
};

export const mockLoginResponse: UseLoginResponse = {
  access_token: "mock-access-token-xyz",
  refresh_token: "mock-refresh-token-abc",
  token_type: "Bearer",
  expires_in: 3600,
};
