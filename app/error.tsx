'use client';
import { Button } from '@/components/ui';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="empty-state"><h1>Let’s try that again.</h1><p>We couldn’t load this page. Your saved activity stays with your account.</p><Button onClick={reset}>Try again</Button></div>; }
