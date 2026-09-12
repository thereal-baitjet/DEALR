import type { Metadata } from 'next';
import { BrokerDashboard } from '@/components/brokers';
export const metadata: Metadata = { title: 'Broker workspace' };
export default function Page() { return <BrokerDashboard />; }
