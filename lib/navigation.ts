const fallback = '/dashboard';
const localOrigin = 'https://dealr.invalid';

// Shared by browser navigation and server callbacks. URL parsing removes tabs
// and newlines and resolves dot segments, so a prefix check alone is not enough.
export function safeNext(value: string | null | undefined): string {
  if (!value?.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const url = new URL(value, localOrigin);
    if (url.origin !== localOrigin || url.pathname.startsWith('//')) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
