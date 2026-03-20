import type {
  UseRegisterRequest,
  UseRegisterResponse,
} from "@lib/apis/mutations/auth/useRegisterMutation/useRegisterMutation.type";

export const mockRegisterRequest: UseRegisterRequest = {
  email: "newuser@example.com",
  password: "newpassword123!",
};

export const mockRegisterResponse: UseRegisterResponse = {
  access_token: "mock-access-token-new",
  refresh_token: "mock-refresh-token-new",
  token_type: "Bearer",
  expires_in: 3600,
};
