/**
 * Simple token storage for Neon/JWT auth (replaces Supabase session).
 */
const KEY = 'doki_token';

export function setToken(token: string): void {
  if (typeof window !== 'undefined') window.sessionStorage.setItem(KEY, token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(KEY);
}

export function clearToken(): void {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(KEY);
}
