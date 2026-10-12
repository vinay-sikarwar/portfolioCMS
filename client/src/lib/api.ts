/**
 * Central API configuration and helper.
 * Uses VITE_API_BASE_URL from environment variables.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
}

/**
 * Safe fetch wrapper that handles HTML error pages gracefully instead of
 * throwing raw "Unexpected token 'T', 'The page c'..." SyntaxErrors.
 */
export async function safeFetchJson(path: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: any }> {
  const url = apiUrl(path);
  const response = await fetch(url, options);
  const text = await response.text();

  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    const snippet = text.replace(/<[^>]*>?/gm, "").trim().slice(0, 120);
    throw new Error(
      `Server returned ${response.status} ${response.statusText || ""}: ${snippet || "Non-JSON response"}`
    );
  }

  return { ok: response.ok, status: response.status, data };
}
