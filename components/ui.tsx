'use client';
import { Slot } from '@radix-ui/react-slot';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ArrowRight, CircleAlert, LoaderCircle } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { clsx } from 'clsx';
import Link from 'next/link';

export function Button({ className, variant = 'primary', asChild, ...props }: ComponentProps<'button'> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; asChild?: boolean }) {
  const Tag = asChild ? Slot : 'button';
  return <Tag className={clsx('button', 'button-' + variant, className)} {...props} />;
}
export function Field({ label, children, hint, className }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return <label className={clsx('field', className)}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
export function Modal({ open, onOpenChange, title, description, children, wide }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="modal-overlay" /><Dialog.Content className={clsx('modal', wide && 'modal-wide')} aria-describedby={description ? undefined : undefined}><div className="modal-heading"><div><Dialog.Title>{title}</Dialog.Title>{description && <Dialog.Description>{description}</Dialog.Description>}</div><Dialog.Close className="icon-button" aria-label="Close dialog"><X size={20} /></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
export function Empty({ icon, title, children, href, action }: { icon?: ReactNode; title: string; children: ReactNode; href?: string; action?: string }) {
  return <div className="empty-state"><div className="empty-icon">{icon || <CircleAlert />}</div><h2>{title}</h2><p>{children}</p>{href && <Button asChild><Link href={href}>{action || 'Explore marketplace'}<ArrowRight size={16} /></Link></Button>}</div>;
}
export function ErrorNotice({ children }: { children: ReactNode }) { return <p className="notice notice-error" role="alert"><CircleAlert size={18} />{children}</p>; }
export function Loading({ cards = false }: { cards?: boolean }) { return cards ? <div className="listing-grid" aria-label="Loading listings" aria-busy="true">{Array.from({ length: 8 }, (_, i) => <div className="skeleton-card" key={i}><div /><span /><span /></div>)}</div> : <div className="loading" role="status"><LoaderCircle className="spin" size={20} /> Loading…</div>; }
