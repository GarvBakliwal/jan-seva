'use client';

import Link from 'next/link';
import { MailCheck, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ConfirmationCard() {
  const params = useSearchParams();
  const email = params.get('email') ?? 'your email address';
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const resend = async () => {
    if (!email || email === 'your email address') return;
    setSending(true);
    const { error } = await createClient().auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setMessage(error ? error.message : 'A fresh confirmation email has been sent.');
    setSending(false);
  };

  return <div className="card text-center" style={{ padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
    <MailCheck size={56} className="mx-auto mb-4 text-emerald-600" aria-hidden="true" />
    <h1 className="text-xl font-bold" style={{ color: 'var(--gov-navy)' }}>Confirm your email</h1>
    <p className="text-sm mt-2 text-gray-600 leading-relaxed">We sent a confirmation link to <strong className="text-gray-900 break-all">{email}</strong>. Open it to activate your Jan Seva account.</p>
    <button type="button" onClick={resend} disabled={sending} className="btn btn-secondary w-full mt-6"><RefreshCw size={16} className={sending ? 'animate-spin' : ''} />{sending ? 'Sending…' : 'Resend confirmation email'}</button>
    {message && <p role="status" className="text-xs mt-3 text-gray-600">{message}</p>}
    <Link href="/" className="block mt-5 text-sm font-semibold text-[var(--gov-blue)]">Return to home</Link>
  </div>;
}
