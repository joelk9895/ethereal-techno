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

  // After every successful auth call, trigger a background role sync
  if (response.ok && typeof window !== "undefined") {
    scheduleRoleSync();
  }

  return response;
}

// --- Background Role Sync ---
// Periodically checks if the user's role changed server-side and redirects if needed.
let lastRoleSyncTime = 0;
const ROLE_SYNC_INTERVAL = 30_000; // 30 seconds minimum between syncs
let roleSyncPending = false;

function scheduleRoleSync() {
  const now = Date.now();
  if (now - lastRoleSyncTime < ROLE_SYNC_INTERVAL || roleSyncPending) return;

  roleSyncPending = true;
  lastRoleSyncTime = now;

  // Run async without blocking
  syncUserRole().finally(() => {
    roleSyncPending = false;
  });
}

async function syncUserRole() {
  try {
    const token = getAuthToken();
    if (!token) return;

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const parsed = JSON.parse(storedUser);
    const currentType = parsed.type;

    // Lightweight call to check the user's current role
    const res = await fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;

    const data = await res.json();
    const serverType = data.user?.type;

    if (!serverType || serverType === currentType) return;

    // Role changed — update localStorage
    parsed.type = serverType;
    localStorage.setItem("user", JSON.stringify(parsed));

    // Redirect to the correct dashboard
    const currentPath = window.location.pathname;
    const isDashboard = currentPath.startsWith("/dashboard") || currentPath.startsWith("/admin");

    if (isDashboard) {
      switch (serverType) {
        case "ADMIN":
          window.location.href = "/admin";
          break;
        case "ARTIST":
          window.location.href = "/dashboard/producer";
          break;
        default:
          window.location.href = "/dashboard";
          break;
      }
    }
  } catch {
    // Silently fail — this is a background sync
  }
}

