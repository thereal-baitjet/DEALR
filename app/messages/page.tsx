import type { Metadata } from 'next';
import { Inbox } from '@/components/conversations';
export const metadata: Metadata = { title: 'Messages' };
export default function Page() { return <Inbox />; }
