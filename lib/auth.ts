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

export async function stickyRefresh(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
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
  }
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = getAuthToken();

  const makeRequest = async (t: string | null) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${t}`,
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
    });
  };

  let response = await makeRequest(token);

  if (response.status === 401) {
    // Create a retry logic
    const newToken = await stickyRefresh();
    if (newToken) {
      response = await makeRequest(newToken);
    } else {
      // If refresh fails, user is logged out (or should be)
      // We can trigger logout or just let it fail
      // logout(); // Optional: force logout on failed refresh logic
    }
  }

  return response;
}
