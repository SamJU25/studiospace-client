import { getTokenFromClient } from "./getTokenFromClient";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
  serverToken?: string;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requireAuth = false, serverToken, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (!finalHeaders.has("Content-Type") && rest.body) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (serverToken) {
    finalHeaders.set("Authorization", `Bearer ${serverToken}`);
  } else if (requireAuth && typeof window !== "undefined") {
    const token = await getTokenFromClient();
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : null;

  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export async function syncServerCookie(): Promise<void> {
  try {
    const token = await getTokenFromClient();
    if (!token) return;
    await fetch(`${API_BASE_URL}/api/auth/cookie`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  } catch {
    // Non-blocking: Bearer JWT still accompanies authenticated requests
  }
}

export async function clearServerCookie(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore network cleanup failures on signout
  }
}
