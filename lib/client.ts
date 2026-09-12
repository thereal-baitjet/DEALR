'use client';
import { useCallback, useEffect, useState } from 'react';

export class RequestError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function request<T>(url: string, data?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch('/api/' + url, { method: data === undefined ? 'GET' : 'POST', headers: data === undefined ? {} : { 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data), cache: 'no-store', signal });
  const result = await response.json();
  if (!response.ok) throw new RequestError(response.status, result.error || 'Please try again.');
  return result;
}
export function useRemote<T>(url: string | null, identity = '') {
  const [version, setVersion] = useState(0);
  const key = url + ':' + identity + ':' + version;
  const [result, setResult] = useState<{ key: string; data?: T; error?: string }>({ key: '' });
  useEffect(() => {
    if (!url) return;
    const abort = new AbortController();
    request<T>(url, undefined, abort.signal).then(data => setResult({ key, data })).catch(error => { if (!abort.signal.aborted) setResult({ key, error: error.message }); });
    return () => abort.abort();
  }, [url, key]);
  const reload = useCallback(() => setVersion(v => v + 1), []);
  return { data: result.key === key ? result.data : undefined, error: result.key === key ? result.error : undefined, loading: Boolean(url && (result.key !== key || !result.data && !result.error)), reload };
}
