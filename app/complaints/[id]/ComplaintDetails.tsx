'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Copy, Check, MapPin, Calendar, AlertCircle } from 'lucide-react';
import type { Complaint, ComplaintStatus } from '@/types/complaint';
import type { Profile } from '@/types/profile';
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_ORDER } from '@/types/complaint';
import { formatDateTime } from '@/lib/utils';

type HistoryEntry = { id: string; status: ComplaintStatus; remarks: string | null; created_at: string };
type ComplaintResponse = Complaint & { complaint_status_history?: HistoryEntry[] };

export default function ComplaintDetails({ complaintId }: { complaintId: string; profile: Profile }) {
  const [complaint, setComplaint] = useState<ComplaintResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/complaints/${complaintId}`).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Complaint not found.');
      setComplaint(result.data);
    }).catch((reason: Error) => setError(reason.message));
  }, [complaintId]);

  if (error) return <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800"><AlertCircle size={16} className="inline mr-1" />{error}</div>;
  if (!complaint) return <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center text-sm text-gray-500">Loading complaint…</div>;

  const currentIndex = STATUS_ORDER.indexOf(complaint.status);
  const copy = async () => { await navigator.clipboard.writeText(complaint.complaint_number); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return <div className="space-y-5 text-gray-900">
    <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3"><div className="flex items-start justify-between gap-2"><div><h1 className="text-xl font-extrabold text-[var(--gov-navy)]">Complaint Details</h1><p className="text-xs text-gray-500">Live grievance record and status timeline</p></div><span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-100">{STATUS_LABELS[complaint.status]}</span></div><div className="p-3 bg-blue-50/60 rounded-xl border border-blue-150 flex items-center justify-between"><div><span className="text-[10px] font-mono text-gray-400 block uppercase">Tracking ticket</span><span className="font-mono font-extrabold text-sm text-blue-900">{complaint.complaint_number}</span></div><button type="button" onClick={copy} className="py-1.5 px-3 bg-[var(--gov-navy)] text-white rounded-lg text-xs font-bold flex gap-1 items-center">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button></div><div className="text-[11px] text-gray-600">Submitted {formatDateTime(complaint.created_at)} · Updated {formatDateTime(complaint.updated_at)}</div></div>
    <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3"><h2 className="text-sm font-bold">Issue</h2><span className="inline-block text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">{CATEGORY_LABELS[complaint.category]}</span><p className="text-sm leading-relaxed">{complaint.description}</p>{complaint.address && <p className="text-xs text-gray-600 flex gap-1.5"><MapPin size={14} className="text-red-500" />{complaint.address}</p>}{complaint.image_url && <div className="relative h-48 rounded-xl overflow-hidden"><Image src={complaint.image_url} alt="Uploaded complaint evidence" fill className="object-cover" unoptimized /></div>}</div>
    <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3"><h2 className="text-sm font-bold">Status timeline</h2><div className="grid grid-cols-4 gap-1">{STATUS_ORDER.map((step, index) => <div key={step} className={`p-2 rounded-lg text-center text-[10px] font-bold ${index <= currentIndex ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-gray-50 text-gray-400'}`}>{index + 1}. {STATUS_LABELS[step]}</div>)}</div><div className="space-y-2">{(complaint.complaint_status_history ?? []).map((entry) => <div key={entry.id} className="border-l-2 border-blue-200 pl-3 text-xs"><div className="font-semibold">{STATUS_LABELS[entry.status]}</div><div className="text-gray-500"><Calendar size={12} className="inline mr-1" />{formatDateTime(entry.created_at)}</div>{entry.remarks && <p className="text-gray-700 mt-1">{entry.remarks}</p>}</div>)}</div></div>
    <Link href="/complaints" className="block text-center py-3 rounded-xl bg-blue-50 text-[var(--gov-blue)] text-xs font-bold">Back to My Complaints</Link>
  </div>;
}
