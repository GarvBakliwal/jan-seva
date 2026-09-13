'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Eye, RotateCcw, Search, Shield, UserCheck } from 'lucide-react';
import type { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@/types/complaint';
import type { Profile } from '@/types/profile';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/types/complaint';
import { formatDateTime } from '@/lib/utils';

type AdminComplaint = Complaint & { profiles?: { name: string; email: string; phone: string | null } };
type StaffMember = { id: string; name: string; email: string };

export default function AdminDashboard({ profile }: { profile: Profile }) {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'ALL' | ComplaintCategory>('ALL');
  const [status, setStatus] = useState<'ALL' | ComplaintStatus>('ALL');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category !== 'ALL') params.set('category', category);
    if (status !== 'ALL') params.set('status', status);
    params.set('page', String(page));
    params.set('limit', '20');
    const response = await fetch(`/api/admin/complaints?${params}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load complaints.');
    setComplaints(result.data?.items ?? []);
    setTotal(result.data?.total ?? 0);
  }, [category, page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => { load().catch((reason: Error) => setError(reason.message)); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetch('/api/admin/staff').then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        setStaff(result.data ?? []);
      }).catch(() => undefined);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const metrics = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter((item) => item.status === 'REPORTED' || item.status === 'UNDER_REVIEW').length,
    progress: complaints.filter((item) => item.status === 'IN_PROGRESS').length,
    resolved: complaints.filter((item) => item.status === 'RESOLVED').length,
  }), [complaints]);

  const updateStatus = async (id: string, nextStatus: ComplaintStatus, fields: Partial<{ priority: ComplaintPriority; assigned_department: string; assigned_to: string | null }> = {}) => {
    setUpdating(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/complaints/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus, ...fields }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to update status.');
      setComplaints((items) => items.map((item) => item.id === id ? { ...item, ...result.data } : item));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update status.'); }
    finally { setUpdating(null); }
  };

  return <div className="space-y-6 text-gray-900">
    <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs"><div className="flex items-center gap-2"><Image src="/images/jan-seva-official-seal.svg" alt="Jan Seva official seal" width={40} height={40} className="w-10 h-10 shrink-0" /><div><span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 uppercase">Officer Dashboard</span><h1 className="text-base font-extrabold text-[var(--gov-navy)] mt-1">{profile.name}</h1><p className="text-[11px] text-gray-500">Live data from the Jan Seva complaint registry</p></div></div></div>
    <div className="grid grid-cols-2 gap-2.5">{[['Total Complaints', metrics.total, Shield], ['Action Required', metrics.pending, AlertTriangle], ['In Progress', metrics.progress, UserCheck], ['Resolved', metrics.resolved, CheckCircle2]].map(([label, value, Icon]) => <div key={String(label)} className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs"><div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase"><span>{String(label)}</span>{typeof Icon === 'function' && <Icon size={14} />}</div><div className="text-2xl font-extrabold text-[var(--gov-navy)]">{String(value)}</div></div>)}</div>
    <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3"><div className="text-xs font-bold">Complaint filters</div><div className="relative"><Search size={16} className="absolute left-3 top-3 text-gray-400" /><input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Search complaint number, description, or address" className="w-full py-2.5 px-3.5 pl-9 bg-white border border-gray-300 rounded-xl text-xs" /></div><div className="grid grid-cols-2 gap-2"><select value={category} onChange={(e) => { setPage(1); setCategory(e.target.value as typeof category); }} className="py-2 px-2.5 bg-white border border-gray-300 rounded-xl text-xs"><option value="ALL">All categories</option>{Object.entries(CATEGORY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value as typeof status); }} className="py-2 px-2.5 bg-white border border-gray-300 rounded-xl text-xs"><option value="ALL">All statuses</option>{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><button type="button" onClick={() => { setPage(1); setSearch(''); setCategory('ALL'); setStatus('ALL'); }} className="py-2 px-3 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1"><RotateCcw size={13} />Reset filters</button></div>
    {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">{error}</div>}
    <div className="space-y-3">{complaints.length === 0 && !error && <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center text-sm text-gray-500">No complaints match the current filters.</div>}{complaints.map((complaint) => <article key={complaint.id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2.5"><div className="flex items-center justify-between gap-2"><span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded">{complaint.complaint_number}</span><span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-slate-100">{STATUS_LABELS[complaint.status]}</span></div><span className="inline-block text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">{CATEGORY_LABELS[complaint.category]}</span><h2 className="text-sm font-extrabold">{complaint.description}</h2><p className="text-[11px] text-gray-500">{complaint.address || 'No address provided'} · {formatDateTime(complaint.created_at)}</p><div className="flex flex-wrap items-center gap-2"><label className="text-[10px] font-semibold text-gray-500">Priority<select value={complaint.priority ?? 'NORMAL'} onChange={(e) => updateStatus(complaint.id, complaint.status, { priority: e.target.value as ComplaintPriority })} className="ml-1 py-1 px-1.5 border border-gray-200 rounded text-[10px]"><option value="LOW">Low</option><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label><label className="text-[10px] font-semibold text-gray-500">Department<select value={complaint.assigned_department ?? ''} onChange={(e) => updateStatus(complaint.id, complaint.status, { assigned_department: e.target.value })} className="ml-1 py-1 px-1.5 border border-gray-200 rounded text-[10px]"><option value="">Unassigned</option><option>Roads & Infrastructure</option><option>Sanitation</option><option>Water & Sewerage</option><option>Electrical Services</option><option>General Grievance Cell</option></select></label><label className="text-[10px] font-semibold text-gray-500">Officer<select value={complaint.assigned_to ?? ''} onChange={(e) => updateStatus(complaint.id, complaint.status, { assigned_to: e.target.value || null })} className="ml-1 py-1 px-1.5 border border-gray-200 rounded text-[10px]"><option value="">Unassigned</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label></div><div className="flex flex-wrap gap-2">{(['UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'] as ComplaintStatus[]).filter((next) => next !== complaint.status).map((next) => <button key={next} type="button" disabled={updating === complaint.id} onClick={() => updateStatus(complaint.id, next)} className="py-1.5 px-2.5 bg-blue-50 text-[var(--gov-blue)] border border-blue-200 rounded-lg text-[10px] font-bold disabled:opacity-50">Mark {STATUS_LABELS[next]}</button>)}<Link href={`/admin/complaints/${complaint.id}`} className="admin-detail-cta py-1.5 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1"><Eye size={13} />View full details</Link></div></article>)}</div>
    <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Page {page} · {total} total complaints</span><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">Previous</button><button type="button" disabled={page * 20 >= total} onClick={() => setPage((current) => current + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">Next</button></div></div>
  </div>;
}
