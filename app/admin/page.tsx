import type { Metadata } from 'next';
import { Admin } from '@/components/admin';
export const metadata: Metadata = { title: 'Administration' };
export default function Page() { return <Admin />; }
