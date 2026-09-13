'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Copy, Check, PlusCircle, Search, MapPin, Calendar, AlertCircle } from 'lucide-react';
import type { Complaint, ComplaintStatus } from '@/types/complaint';
import type { Profile } from '@/types/profile';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/types/complaint';
import { formatDate } from '@/lib/utils';
import LoadingState from '@/components/LoadingState';

export default function ComplaintsList({}: { profile: Profile }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | ComplaintStatus>('ALL');
  const [category, setCategory] = useState('ALL');
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/complaints').then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to load complaints.');
      setComplaints(result.data ?? []);
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => complaints.reduce<Record<string, number>>((all, complaint) => {
    all[complaint.status] = (all[complaint.status] ?? 0) + 1;
    return all;
  }, {}), [complaints]);

  const visible = complaints.filter((complaint) => {
    const text = `${complaint.complaint_number} ${complaint.description} ${complaint.address ?? ''}`.toLowerCase();
    return (status === 'ALL' || complaint.status === status) && (category === 'ALL' || complaint.category === category) && text.includes(query.toLowerCase());
  });

  const copyNumber = async (number: string) => {
    await navigator.clipboard.writeText(number);
    setCopied(number);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-900 bg-blue-100/80 px-2.5 py-1 rounded border border-blue-200 uppercase tracking-wide">CITIZEN GRIEVANCE REDRESSAL</div>
        <div><h1 className="text-xl sm:text-2xl font-extrabold text-[var(--gov-navy)]">My Complaints</h1><p className="text-xs text-gray-600 mt-1">Track the complaints submitted from your account.</p></div>
        <Link href="/report" className="report-cta w-full py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2"><PlusCircle size={16} className="text-[var(--gov-saffron)]" />Report an Issue</Link>
      </div>

      <div className="relative z-0 grid grid-cols-2 gap-2.5">
        {(['ALL', 'REPORTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'] as const).map((key) => (
          <button key={key} type="button" onClick={() => setStatus(key)} className={`p-3 rounded-xl border text-left ${status === key ? 'bg-[var(--gov-navy)] text-white border-[var(--gov-navy)]' : 'bg-white border-gray-200'}`}>
            <span className="block text-[10px] font-semibold uppercase">{key === 'ALL' ? 'Total Logged' : STATUS_LABELS[key]}</span><span className="text-xl font-extrabold">{key === 'ALL' ? complaints.length : counts[key] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3"><div className="relative"><Search size={16} className="absolute left-3 top-3 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by complaint ID or keyword" className="w-full py-2.5 px-3.5 pl-9 bg-white border border-gray-300 rounded-xl text-xs" /></div><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full py-2.5 px-3 bg-white border border-gray-300 rounded-xl text-xs"><option value="ALL">All Categories</option>{Object.entries(CATEGORY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>

      {loading ? <LoadingState rows={2} message="Loading your complaints…" /> : <>
        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800"><AlertCircle size={14} className="inline mr-1" />{error}</div>}
        {!error && visible.length === 0 && <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center text-sm text-gray-500">No complaints match your filters.</div>}
        <div className="space-y-3">{visible.map((complaint) => <article key={complaint.id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-1.5"><span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-150">{complaint.complaint_number}</span><button type="button" onClick={() => copyNumber(complaint.complaint_number)} aria-label="Copy complaint number">{copied === complaint.complaint_number ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-gray-400" />}</button></div><span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-700">{STATUS_LABELS[complaint.status]}</span></div><span className="inline-block text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{CATEGORY_LABELS[complaint.category]}</span><h2 className="text-sm font-extrabold leading-snug">{complaint.description}</h2><div className="text-xs text-gray-600 space-y-1">{complaint.address && <div className="flex gap-1.5"><MapPin size={14} className="text-red-500 shrink-0" />{complaint.address}</div>}<div className="flex gap-1.5"><Calendar size={14} className="text-gray-400 shrink-0" />Reported {formatDate(complaint.created_at)}</div></div><Link href={`/complaints/${complaint.id}`} className="block text-center py-2 rounded-lg bg-blue-50 text-[var(--gov-blue)] text-xs font-bold">View complaint details</Link></article>)}</div>
      </>}
    </div>
  );
}
