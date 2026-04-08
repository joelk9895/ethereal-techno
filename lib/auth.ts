import { UserType } from "@prisma/client";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  type: UserType;
  name?: string;
  surname?: string;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const userData = localStorage.getItem("user");
    if (!userData) return null;

    return JSON.parse(userData);
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export async function logout() {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) {
    console.error("Logout API failed", e);
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  window.location.href = "/signin";
}

export async function verifyToken(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

let refreshPromise: Promise<string | null> | null = null;

export async function stickyRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", { 
        method: "POST", 
        credentials: "include" 
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          return data.accessToken;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = getAuthToken();

  const makeRequest = async (t: string | null) => {
    // Standardize headers as a plain object for consistent merging
    const headers: Record<string, string> = {};

    // Copy existing headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    // Add Authorization if token exists
    if (t) {
      headers["Authorization"] = `Bearer ${t}`;
    }

    // Add Content-Type for JSON body if not already set
    if (options.body && !(options.body instanceof FormData)) {
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest(token);

  if (response.status === 401) {
    console.log(`[AUTH] 401 on ${url}, attempting refresh...`);
    const newToken = await stickyRefresh();
    if (newToken) {
      console.log(`[AUTH] Refresh success for ${url}, retrying...`);
      response = await makeRequest(newToken);
    } else {
      console.log(`[AUTH] Refresh failed for ${url}, clearing storage and redirecting...`);
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }
  }

  return response;
}
