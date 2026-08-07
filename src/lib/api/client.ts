// src/lib/api/client.ts
'use client';

type RequestOptions = RequestInit & { skipRefresh?: boolean };

const TOKEN_KEY = 'profolio_token';
const REFRESH_TOKEN_KEY = 'profolio_refresh_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(token: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  const isDev = process.env.NODE_ENV !== 'production';
  const secureFlag = isDev ? '' : '; Secure';
  document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Lax${secureFlag};`;
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = 'token=; path=/; max-age=0';
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return false;
    }

    const data = await res.json();
    setTokens(data.token, data.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

/**
 * Wrapper fetch qui gère automatiquement le JWT en cookie et son renouvellement
 * silencieux via refresh token en cas d'expiration (401).
 */
export async function apiFetch(url: string, options: RequestOptions = {}): Promise<Response> {
  const res = await fetch(url, { ...options, credentials: 'include' });

  if (res.status !== 401 || options.skipRefresh) {
    return res;
  }

  const refreshed = await tryRefresh();
  if (!refreshed) {
    return res;
  }

  return fetch(url, { ...options, credentials: 'include' });
}

export async function apiGet<T = unknown>(url: string): Promise<T> {
  const res = await apiFetch(url);
  if (!res.ok) {
    let errorBody: unknown = {};
    try {
      errorBody = await res.json();
    } catch {
      const text = await res.text().catch(() => '');
      errorBody = { error: 'Erreur inconnue', status: res.status, detail: text.substring(0, 200) };
    }
    throw errorBody;
  }
  return res.json();
}

export async function apiPost<T = unknown>(url: string, body: unknown): Promise<T> {
  const res = await apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let errorBody: unknown = {};
    try {
      errorBody = await res.json();
    } catch {
      const text = await res.text().catch(() => '');
      errorBody = { error: 'Erreur inconnue', status: res.status, detail: text.substring(0, 200) };
    }
    throw errorBody;
  }
  return res.json();
}

export async function apiPut<T = unknown>(url: string, body: unknown): Promise<T> {
  const res = await apiFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let errorBody: unknown = {};
    try {
      errorBody = await res.json();
    } catch {
      const text = await res.text().catch(() => '');
      errorBody = { error: 'Erreur inconnue', status: res.status, detail: text.substring(0, 200) };
    }
    throw errorBody;
  }
  return res.json();
}

export async function apiPatch<T = unknown>(url: string, body: unknown): Promise<T> {
  const res = await apiFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let errorBody: unknown = {};
    try {
      errorBody = await res.json();
    } catch {
      const text = await res.text().catch(() => '');
      errorBody = { error: 'Erreur inconnue', status: res.status, detail: text.substring(0, 200) };
    }
    throw errorBody;
  }
  return res.json();
}

export async function apiDelete<T = unknown>(url: string): Promise<T> {
  const res = await apiFetch(url, { method: 'DELETE' });
  if (!res.ok) {
    let errorBody: unknown = {};
    try {
      errorBody = await res.json();
    } catch {
      const text = await res.text().catch(() => '');
      errorBody = { error: 'Erreur inconnue', status: res.status, detail: text.substring(0, 200) };
    }
    throw errorBody;
  }
  return res.json();
}
