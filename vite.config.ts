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
      const pathname = url.split("?")[0];
      const isAsset =
        pathname.startsWith("/@") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/src") ||
        pathname.startsWith("/node_modules") ||
        pathname.includes(".");

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
            target: "http://4.230.10.204",
            changeOrigin: true,
          },
        },
      },
    }),
  };
});
