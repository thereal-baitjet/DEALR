import { Suspense } from 'react';
import { Marketplace } from '@/components/marketplace';
import { Loading } from '@/components/ui';
export default function Page() { return <Suspense fallback={<Loading />}><Marketplace /></Suspense>; }
