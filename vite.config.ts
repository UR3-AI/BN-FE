import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

import path from "path";
import type { Connect, Plugin, ViteDevServer } from "vite";
import { defineConfig } from "vite";

const mockSpaFallback = (): Plugin => ({
  name: "mock-spa-fallback",
  configureServer(server: ViteDevServer) {
    server.middlewares.use(((req: Connect.IncomingMessage, _res, next) => {
      const url = req.url ?? "";
      const isAsset =
        url.startsWith("/@") ||
        url.startsWith("/api") ||
        url.startsWith("/src") ||
        url.startsWith("/node_modules") ||
        url.includes(".");

      if (!isAsset) {
        req.url = "/mock.html";
      }
      next();
    }) as Connect.NextHandleFunction);
  },
});

export default defineConfig(({ mode }) => {
  const isMock = mode === "mock";

  return {
    plugins: [react(), tailwindcss(), ...(isMock ? [mockSpaFallback()] : [])],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@app": path.resolve(__dirname, "./src/app"),
      },
    },
    ...(isMock && {
      server: {
        proxy: {
          "/api": {
            target: "https://bn-be-production.up.railway.app",
            changeOrigin: true,
          },
        },
      },
    }),
  };
});
