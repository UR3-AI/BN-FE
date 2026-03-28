import { useEffect } from "react";

import { refreshTokenGuard } from "@lib/apis";
import { useAuthStore } from "@lib/stores";

const REFRESH_BUFFER_SEC = 60;

const useTokenRefresh = () => {
  const { accessToken, refreshToken, expiresAt } = useAuthStore();
  const { setTokens, clearTokens } = useAuthStore();

  useEffect(() => {
    if (!refreshToken || !expiresAt) return;

    const delay = !accessToken
      ? 0
      : expiresAt - Date.now() - REFRESH_BUFFER_SEC * 1000;

    const timerId = setTimeout(
      async () => {
        try {
          const data = await refreshTokenGuard(refreshToken);

          setTokens(data.access_token, data.refresh_token, data.expires_in);
        } catch {
          clearTokens();
        }
      },
      Math.max(delay, 0),
    );

    return () => clearTimeout(timerId);
  }, [accessToken, refreshToken, expiresAt, setTokens, clearTokens]);
};

export default useTokenRefresh;
