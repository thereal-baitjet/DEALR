import type { Metadata } from 'next';
import { Conversation } from '@/components/conversations';
export const metadata: Metadata = { title: 'Conversation' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Conversation id={(await params).id} />;
}
