import type { Tokens } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

let memoryAccessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

const REFRESH_STORAGE_KEY = "shop_refresh_token";

export const tokenStorage = {
  get accessToken() {
    return memoryAccessToken;
  },
  setTokens(tokens: Tokens) {
    memoryAccessToken = tokens.access_token;
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_STORAGE_KEY, tokens.refresh_token);
    }
  },
  clear() {
    memoryAccessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(REFRESH_STORAGE_KEY);
    }
  },
  getRefreshToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_STORAGE_KEY);
  },
};

async function rawRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (tokenStorage.accessToken) {
    headers.set("Authorization", `Bearer ${tokenStorage.accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = {
      message: body.detail || body.message || "Произошла ошибка",
      status: response.status,
      details: body,
    };
    throw error;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const data = await rawRequest<{ access_token?: string; tokens?: Tokens }>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const accessToken = data.tokens?.access_token ?? data.access_token ?? null;
      if (!accessToken) {
        tokenStorage.clear();
        return null;
      }

      memoryAccessToken = accessToken;
      if (data.tokens?.refresh_token) {
        localStorage.setItem(REFRESH_STORAGE_KEY, data.tokens.refresh_token);
      }
      return accessToken;
    } catch {
      tokenStorage.clear();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiClient<T>(path: string, init: RequestInit = {}, shouldRetry = true): Promise<T> {
  try {
    return await rawRequest<T>(path, init);
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (shouldRetry && (status === 401 || status === 403)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiClient<T>(path, init, false);
      }
    }
    throw error;
  }
}
