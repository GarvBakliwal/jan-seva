'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, ExternalLink } from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export default function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch('/api/notifications');
    if (!response.ok) return;
    const result = await response.json();
    setItems(result.data ?? []);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { load().catch(() => undefined); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const unread = items.filter((item) => !item.read_at);
  const markAllRead = async () => {
    if (!unread.length) return;
    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: unread.map((item) => item.id) }),
    });
    if (response.ok) setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
  };

  const panel = open ? <div className="notification-popover fixed top-32 left-2 right-2 md:top-20 md:left-auto md:right-4 md:w-80 md:max-w-[calc(100vw-2rem)] bg-white text-gray-900 rounded-xl border border-gray-200 shadow-xl z-[100] overflow-hidden">
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200"><span className="text-sm font-bold text-gray-900">Notifications</span><button type="button" onClick={markAllRead} disabled={!unread.length} className="text-xs font-semibold text-blue-700 disabled:text-gray-400 flex items-center gap-1 whitespace-nowrap"><Check size={13} />Mark all read</button></div>
    <div className="max-h-72 overflow-y-auto">{items.length === 0 && <p className="p-5 text-xs text-gray-500 text-center">No notifications yet.</p>}{items.slice(0, 10).map((item) => <div key={item.id} className={`px-4 py-3 border-b border-gray-100 ${item.read_at ? 'bg-white' : 'bg-blue-50/60'}`}><p className="text-xs font-bold text-gray-900">{item.title}</p><p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{item.body}</p><time className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleString('en-IN')}</time></div>)}</div>
    <Link href="/complaints" onClick={() => setOpen(false)} className="flex items-center justify-center gap-1 py-2.5 text-xs font-bold text-blue-700 bg-gray-50"><ExternalLink size={13} />View my complaints</Link>
  </div> : null;

  return <div className="relative">
    <button type="button" aria-label={`${unread.length} unread notifications`} onClick={() => setOpen((value) => !value)} className="relative text-white/90 hover:text-white p-2 rounded-md hover:bg-white/10">
      <Bell size={17} />
      {unread.length > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{unread.length > 9 ? '9+' : unread.length}</span>}
    </button>
    {typeof document !== 'undefined' && panel ? createPortal(panel, document.body) : null}
  </div>;
}
