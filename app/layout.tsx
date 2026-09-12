import type { Metadata } from 'next';
import { SessionProvider } from '@/components/session';
import { Header, Footer } from '@/components/shell';
import './globals.css';

export const metadata: Metadata = { title: { default: 'DEALR · Find it. List it. Deal it.', template: '%s · DEALR' }, description: 'One marketplace for the things you need and the opportunities ahead. Discover goods, vehicles, places, services, businesses, and equipment.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><SessionProvider><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main">{children}</main><Footer /></SessionProvider></body></html>; }
