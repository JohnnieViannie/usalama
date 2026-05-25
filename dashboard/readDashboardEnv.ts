import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Only dashboard/.env is read — not .env.production, .env.development, etc. */
export function readDashboardEnv(): Record<string, string> {
  const envPath = path.join(__dirname, ".env");
  const out: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return out;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function apiBaseFromEnv(env: Record<string, string>): string {
  return (env.VITE_API_URL || "https://server.movarasec.com/api").replace(/\/$/, "");
}
