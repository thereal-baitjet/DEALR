import type { Metadata } from 'next';
import { BrokerDirectory } from '@/components/brokers';
export const metadata: Metadata = { title: 'Find a broker' };
export default function Page() { return <BrokerDirectory />; }
