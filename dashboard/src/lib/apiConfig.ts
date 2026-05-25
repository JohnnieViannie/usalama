/**
 * API base URL — set only in dashboard/.env as VITE_API_URL.
 * Injected at dev/build time via vite.config.ts (reads .env only).
 */
declare const __API_BASE_URL__: string;

const DEFAULT_API_BASE = "https://server.movarasec.com/api";

function normalizeApiBase(raw: string): string {
  const value = (raw ?? "").trim() || DEFAULT_API_BASE;
  if (value === "/api" || (!value.startsWith("http://") && !value.startsWith("https://"))) {
    console.error(
      "[MovaraHub] Invalid API URL:",
      value,
      "— set VITE_API_URL in dashboard/.env (absolute URL, e.g. https://server.movarasec.com/api)",
    );
    return DEFAULT_API_BASE;
  }
  return value.replace(/\/$/, "");
}

export const apiBaseUrl = normalizeApiBase(__API_BASE_URL__);
