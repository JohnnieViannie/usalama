import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { apiBaseFromEnv, readDashboardEnv } from "./readDashboardEnv";

// Single source of truth: dashboard/.env only (see readDashboardEnv.ts).
const dashboardEnv = readDashboardEnv();
const apiUrl = apiBaseFromEnv(dashboardEnv);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  envFile: false,
  define: {
    __API_BASE_URL__: JSON.stringify(apiUrl),
  },
  server: {
    host: "::",
    port: 3000,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/media": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
