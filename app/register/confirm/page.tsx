import type { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConfirmationCard from './ConfirmationCard';

export const metadata: Metadata = { title: 'Confirm your email | Jan Seva' };

export default function EmailConfirmationPage() {
  return <><Header /><main className="flex-1 flex items-center justify-center py-12 px-4" style={{ background: 'var(--gray-50)' }}><div className="w-full max-w-md"><Suspense fallback={<div className="card p-8 text-center text-sm text-gray-500">Loading confirmation…</div>}><ConfirmationCard /></Suspense></div></main><Footer /></>;
}
