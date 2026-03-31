const KEY = 'doki_guest';

export function setGuest(): void {
  if (typeof window !== 'undefined') window.sessionStorage.setItem(KEY, '1');
}

export function clearGuest(): void {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(KEY);
}

export function isGuest(): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(KEY) === '1';
}
