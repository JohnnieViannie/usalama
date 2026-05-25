import { apiBaseUrl } from "@/lib/apiConfig";

/** Absolute API base — dashboard/.env only (see readDashboardEnv.ts) */
const prefix = apiBaseUrl;

async function readError(res: Response): Promise<string> {
  const text = await res.text();
  if (!text) return `${res.status} ${res.statusText}`;
  try {
    const parsed = JSON.parse(text) as { detail?: string };
    return parsed.detail || text;
  } catch {
    return text;
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem("movara_auth");
  window.location.href = "/login";
}

function authHeaders(): HeadersInit {
  const raw = localStorage.getItem("movara_auth");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (raw) {
    try {
      const { token } = JSON.parse(raw) as { token?: string };
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore */
    }
  }
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${prefix}${path.startsWith("/") ? path : `/${path}`}`, {
      headers: authHeaders(),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (res.status === 401 || res.status === 403) {
    clearAuthAndRedirect();
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<T>;
}

/** Same as apiGet but returns null on 404 or other non-OK (except 401/403, which still redirect). Use for optional endpoints not yet on older servers. */
export async function apiGetAllow404<T>(path: string): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${prefix}${path.startsWith("/") ? path : `/${path}`}`, {
      headers: authHeaders(),
    });
  } catch {
    return null;
  }
  if (res.status === 401 || res.status === 403) {
    clearAuthAndRedirect();
    return null;
  }
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${prefix}${path.startsWith("/") ? path : `/${path}`}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (res.status === 401 || res.status === 403) {
    clearAuthAndRedirect();
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${prefix}${path.startsWith("/") ? path : `/${path}`}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (res.status === 401 || res.status === 403) {
    clearAuthAndRedirect();
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${prefix}${path.startsWith("/") ? path : `/${path}`}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (res.status === 401 || res.status === 403) {
    clearAuthAndRedirect();
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<T>;
}

export async function apiGetAnonymous<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${prefix}${path.startsWith("/") ? path : `/${path}`}`, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<T>;
}

export async function apiPostAnonymous<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${prefix}${path.startsWith("/") ? path : `/${path}`}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${prefix}${path.startsWith("/") ? path : `/${path}`}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (res.status === 401 || res.status === 403) {
    clearAuthAndRedirect();
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await readError(res));
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const text = await res.text();
  if (!text.trim()) return undefined as T;
  return JSON.parse(text) as T;
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].trim());
    } catch {
      return star[1].trim();
    }
  }
  const plain = /filename="?([^";\n]+)"?/i.exec(header);
  return plain?.[1]?.trim() ?? null;
}

/** Authenticated GET that returns a binary file (e.g. DOCX report). */
export async function apiDownloadBlob(
  path: string,
  defaultFilename: string,
): Promise<{ blob: Blob; filename: string }> {
  let res: Response;
  try {
    const headers: Record<string, string> = {};
    const raw = localStorage.getItem("movara_auth");
    if (raw) {
      try {
        const { token } = JSON.parse(raw) as { token?: string };
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch {
        /* ignore */
      }
    }
    res = await fetch(`${prefix}${path.startsWith("/") ? path : `/${path}`}`, {
      headers,
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (res.status === 401 || res.status === 403) {
    clearAuthAndRedirect();
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await readError(res));
  const blob = await res.blob();
  const filename =
    filenameFromContentDisposition(res.headers.get("Content-Disposition")) ??
    defaultFilename;
  return { blob, filename };
}

export { prefix as apiPrefix };
