export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "mm_token";

export function getToken() {
  try { return window.localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable */ }
}

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.auth !== false && typeof window !== "undefined") {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method: opts.method ?? "GET", headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined, cache: "no-store" });
  } catch {
    throw new ApiError("Cannot reach the MatchMint API. Is it running on port 4000?", 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const raw = data?.message;
    const message = Array.isArray(raw) ? raw[0] : raw;
    throw new ApiError(typeof message === "string" ? capitalise(message) : "Something went wrong", res.status);
  }
  return data as T;
}
function capitalise(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

/** For lists that can be cut short for signed-out visitors: the rows plus how many exist in total. */
export async function apiList<T>(path: string): Promise<{ rows: T[]; total: number }> {
  const headers: Record<string, string> = {};
  const token = typeof window !== "undefined" ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { headers, cache: "no-store" });
  } catch {
    throw new ApiError("Cannot reach the MatchMint API. Is it running on port 4000?", 0);
  }
  if (!res.ok) throw new ApiError("Could not load the board", res.status);
  const rows = (await res.json()) as T[];
  return { rows, total: Number(res.headers.get("X-Total-Count") ?? rows.length) };
}
