import * as auth from './auth';

// In browser: always use current origin so API and page are same host (avoids fetch failed)
function getApiBase(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
}

const FETCH_TIMEOUT_MS = 30000;

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    if (e instanceof Error && e.name === 'AbortError') throw new Error('Request timed out');
    throw e;
  }
}

export async function register(email: string, password: string, username: string) {
  const url = `${getApiBase()}/api/auth/register`;
  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
      cache: 'no-store',
    });
  } catch (e) {
    const detail = e instanceof Error ? (e.cause ? String(e.cause) : e.message) : String(e);
    const msg = typeof window !== 'undefined'
      ? `Cannot reach ${url} — ${detail}. Open from the exact server URL (same WiFi).`
      : `Network error: ${detail}`;
    throw new Error(msg);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Register failed');
  return data;
}

export async function login(email: string, password: string) {
  const url = `${getApiBase()}/api/auth/login`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
  } catch (e) {
    const detail = e instanceof Error ? (e.cause ? String(e.cause) : e.message) : String(e);
    const msg = typeof window !== 'undefined'
      ? `Cannot reach ${url} — ${detail}. Open from the exact server URL (same WiFi).`
      : `Network error: ${detail}`;
    throw new Error(msg);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Login failed');
  return data;
}

/** Call from browser to verify the API is reachable (e.g. before login). */
export async function checkReachability(): Promise<{ ok: boolean; url: string }> {
  const url = `${getApiBase()}/api/ping`;
  try {
    const res = await fetch(url);
    return { ok: res.ok, url };
  } catch {
    return { ok: false, url };
  }
}

export async function refreshSession(refreshToken: string) {
  const res = await fetch(`${getApiBase()}/api/auth/refresh`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Refresh failed');
  return data;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = auth.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function dailyBonus() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBase()}/api/currency/daily-bonus`, { method: 'POST', headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export async function getMe() {
  const headers = getAuthHeaders();
  const res = await fetch(`${getApiBase()}/api/me`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load profile');
  return data;
}

export async function getRoster(userId: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBase()}/api/users/${userId}/roster`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to load roster');
  return data;
}

export async function giveCat() {
  const headers = getAuthHeaders();
  const res = await fetch(`${getApiBase()}/api/dev/give-cat`, { method: 'POST', headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to get cat');
  return data;
}

export async function battleInitiate(catId: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBase()}/api/battles/initiate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ cat_id: catId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Initiate failed');
  return data;
}

export async function breedInitiate(parent1Id: string, parent2Id: string) {
  const headers = getAuthHeaders();
  const res = await fetch(`${getApiBase()}/api/breed/initiate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ parent1_id: parent1Id, parent2_id: parent2Id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Breed failed');
  return data;
}

export async function battleComplete(battleId: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBase()}/api/battles/${battleId}/complete`, {
    method: 'POST',
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Complete failed');
  return data;
}

export async function lootboxPull(pullType: 'single' | '10x' = 'single') {
  const headers = getAuthHeaders();
  const res = await fetch(`${getApiBase()}/api/lootbox/pull`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ pull_type: pullType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Pull failed');
  return data;
}
