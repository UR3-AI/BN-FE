import type { AxiosError } from "axios";

import { refreshTokenGuard, useAuthStore } from "@entities/auth";
import { api } from "@shared/api/axios";

const registerApiInterceptors = () => {
  api.interceptors.request.use(config => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest.url === "/api/v1/auth/refresh" ||
        originalRequest.url === "/api/v1/auth/login"
      ) {
        return Promise.reject(error);
      }

      const { refreshToken } = useAuthStore.getState();

      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const data = await refreshTokenGuard(refreshToken);

        useAuthStore.getState().setTokens(data.access_token, data.refresh_token, data.expires_in);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearTokens();

        return Promise.reject(refreshError);
      }
    },
  );
};

export default registerApiInterceptors;
