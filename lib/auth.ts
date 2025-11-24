import { UserType } from "@prisma/client";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  type: UserType;
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

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  window.location.href = "/signin";
}

export async function verifyToken(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch("/api/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = getAuthToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
