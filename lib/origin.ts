import { AppError } from './domain';

// Only server configuration may add trusted hosted origins. Never trust forwarded
// host headers or wildcard *.vercel.app origins for state-changing requests.
export function applicationOrigins(request?: Request): string[] {
  const origins: string[] = [];
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const url = new URL(process.env.NEXT_PUBLIC_APP_URL);
    if (!['https:', 'http:'].includes(url.protocol)) throw new AppError(503, 'Application origin configuration needs attention.');
    origins.push(url.origin);
  }
  if (process.env.VERCEL) {
    const domains = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL];
    if (process.env.VERCEL_ENV === 'production') domains.push(process.env.VERCEL_PROJECT_PRODUCTION_URL);
    for (const domain of domains) {
      if (domain && /^[a-zA-Z0-9.-]+$/.test(domain)) origins.push(new URL('https://' + domain).origin);
    }
  }
  if (!origins.length && !process.env.VERCEL && request) origins.push(new URL(request.url).origin);
  return [...new Set(origins)];
}

export function applicationOrigin(request: Request): string {
  const origins = applicationOrigins(request), requestOrigin = new URL(request.url).origin;
  if (origins.includes(requestOrigin)) return requestOrigin;
  const submittedOrigin = request.headers.get('origin');
  if (submittedOrigin && origins.includes(submittedOrigin)) return submittedOrigin;
  if (origins[0]) return origins[0];
  throw new AppError(503, 'Application origin configuration needs attention.');
}
