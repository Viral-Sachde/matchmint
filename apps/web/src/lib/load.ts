import { API_URL } from "./api";

/** Server-side fetch that returns null instead of throwing, so pages still render if the API is down. */
export async function load<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store", signal: AbortSignal.timeout(2500) });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}
