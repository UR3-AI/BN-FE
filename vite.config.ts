import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isMock = mode === "mock";

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isMock
        ? [
            {
              name: "mock-spa-fallback",
              configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, _res: unknown, next: () => void) => void) => void } }) {
                server.middlewares.use((req, _res, next) => {
                  if (
                    req.url &&
                    !req.url.startsWith("/@") &&
                    !req.url.startsWith("/src") &&
                    !req.url.startsWith("/node_modules") &&
                    !req.url.includes(".")
                  ) {
                    req.url = "/mock.html";
                  }
                  next();
                });
              },
            },
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@app": path.resolve(__dirname, "./src/app"),
      },
    },
  };
});
