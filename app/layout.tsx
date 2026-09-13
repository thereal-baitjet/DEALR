import type { Metadata } from 'next';
import { SessionProvider } from '@/components/session';
import { Header, Footer } from '@/components/shell';
import { CookieConsentProvider } from '@/components/cookie-consent';
import './globals.css';

export const metadata: Metadata = { applicationName: 'DEALR', title: { default: 'DEALR — a Baitjet company', template: '%s · DEALR' }, description: 'DEALR, a Baitjet company. Find it. List it. Deal it. Discover goods, vehicles, places, services, businesses, and equipment in one marketplace.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><SessionProvider><CookieConsentProvider><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main">{children}</main><Footer /></CookieConsentProvider></SessionProvider></body></html>; }
