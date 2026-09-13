'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, Calendar, CheckCircle2, Mail, MapPin, Phone, User } from 'lucide-react';
import type { Complaint, ComplaintStatus } from '@/types/complaint';
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_ORDER } from '@/types/complaint';
import { formatDateTime } from '@/lib/utils';

type HistoryEntry = { id: string; status: ComplaintStatus; remarks: string | null; created_at: string };
type AdminComplaint = Complaint & {
  profiles?: { name: string; email: string; phone: string | null };
  assigned_profile?: { name: string; email: string; phone: string | null } | null;
  complaint_status_history?: HistoryEntry[];
};

export default function AdminComplaintDetails({ complaintId }: { complaintId: string }) {
  const [complaint, setComplaint] = useState<AdminComplaint | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/complaints/${complaintId}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load complaint details.');
        setComplaint(result.data);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [complaintId]);

  if (error) return <div role="alert" className="p-5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800"><AlertCircle size={16} className="inline mr-1" />{error}</div>;
  if (!complaint) return <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center text-sm text-gray-500">Loading complete complaint record…</div>;

  const reporter = complaint.profiles;
  const currentIndex = STATUS_ORDER.indexOf(complaint.status);

  return <div className="space-y-4">
    <section className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wide font-bold text-amber-800">Complete complaint record</p><h1 className="text-xl font-extrabold text-[var(--gov-navy)] mt-1">{complaint.complaint_number}</h1></div><span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">{STATUS_LABELS[complaint.status]}</span></div>
      <div className="grid grid-cols-2 gap-3 text-xs"><div><span className="block text-[10px] uppercase text-gray-400 font-bold">Submitted</span><span>{formatDateTime(complaint.created_at)}</span></div><div><span className="block text-[10px] uppercase text-gray-400 font-bold">Last updated</span><span>{formatDateTime(complaint.updated_at)}</span></div><div><span className="block text-[10px] uppercase text-gray-400 font-bold">Priority</span><span>{complaint.priority ?? 'NORMAL'}</span></div><div><span className="block text-[10px] uppercase text-gray-400 font-bold">Department</span><span>{complaint.assigned_department || 'Unassigned'}</span></div></div>
    </section>

    <section className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3"><h2 className="text-sm font-bold text-[var(--gov-navy)]">Reporter information</h2><div className="grid sm:grid-cols-3 gap-3 text-xs"><div className="flex gap-2"><User size={15} className="text-[var(--gov-blue)] shrink-0" /><span>{reporter?.name || 'Not available'}</span></div><div className="flex gap-2"><Mail size={15} className="text-[var(--gov-blue)] shrink-0" /><span className="break-all">{reporter?.email || 'Not available'}</span></div><div className="flex gap-2"><Phone size={15} className="text-[var(--gov-blue)] shrink-0" /><span>{reporter?.phone || 'Not provided'}</span></div></div></section>

    <section className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3"><h2 className="text-sm font-bold text-[var(--gov-navy)]">Issue details</h2><span className="inline-block text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">{CATEGORY_LABELS[complaint.category]}</span><p className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p><div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-600"><p className="flex gap-1.5"><MapPin size={15} className="text-red-500 shrink-0" />{complaint.address || 'No address provided'}</p><p>Landmark: {complaint.landmark || 'Not provided'}</p><p>Coordinates: {complaint.latitude != null && complaint.longitude != null ? `${complaint.latitude}, ${complaint.longitude}` : 'Not captured'}</p><p>Assigned officer: {complaint.assigned_profile?.name || 'Unassigned'}</p></div>{complaint.additional_comments && <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 text-xs"><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Additional comments</span>{complaint.additional_comments}</div>}{complaint.admin_remarks && <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs"><span className="block text-[10px] uppercase font-bold text-amber-800 mb-1">Administrative remarks</span>{complaint.admin_remarks}</div>}{complaint.image_url && <div className="relative h-64 rounded-xl overflow-hidden border border-gray-200"><Image src={complaint.image_url} alt="Uploaded complaint evidence" fill unoptimized className="object-cover" /></div>}</section>

    <section className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3"><h2 className="text-sm font-bold text-[var(--gov-navy)]">Status history</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{STATUS_ORDER.map((step, index) => <div key={step} className={`p-2 rounded-lg text-center text-[10px] font-bold ${index <= currentIndex ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-gray-50 text-gray-400'}`}>{STATUS_LABELS[step]}</div>)}</div><div className="space-y-3">{(complaint.complaint_status_history ?? []).map((entry) => <div key={entry.id} className="border-l-2 border-blue-200 pl-3 text-xs"><div className="font-semibold flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-600" />{STATUS_LABELS[entry.status]}</div><div className="text-gray-500"><Calendar size={12} className="inline mr-1" />{formatDateTime(entry.created_at)}</div>{entry.remarks && <p className="text-gray-700 mt-1">{entry.remarks}</p>}</div>)}</div></section>

    <Link href="/admin" className="block text-center py-3 rounded-xl bg-blue-50 text-[var(--gov-blue)] text-xs font-bold">Back to Authority Dashboard</Link>
  </div>;
}
