import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';
import { Loading } from '@/components/ui';
export default function Signup() { return <Suspense fallback={<Loading />}><AuthForm signup /></Suspense>; }
