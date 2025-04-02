import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy:
        mode === "development"
          ? {
              "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
                secure: false,
              },
            }
          : {},
    },
    resolve: {
      alias: {
        'services': path.resolve('./services'),
        'react-modal': path.resolve('./node_modules/react-modal'),
      },
    },
  };
});
