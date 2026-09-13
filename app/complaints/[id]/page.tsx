import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComplaintDetails from './ComplaintDetails';
import type { Profile } from '@/types/profile';
import { getSession } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Complaint Details | Jan Seva',
  description: 'Detailed civic grievance record, field inspection audit trail, and SLA status tracking.',
};

export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?from=/complaints/${id}`);
  if (session.profile.role === 'ADMIN') redirect('/admin');
  const profile: Profile = session.profile;

  return (
    <>
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 py-6 px-4 pb-20 md:pb-12 text-gray-900">
        <div className="container-gov max-w-lg mx-auto">
          {/* Breadcrumb & Code Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 text-xs">
            <nav aria-label="Breadcrumb" className="text-gray-500 flex items-center gap-1 font-medium min-w-0 truncate">
              <Link href="/" className="text-[var(--gov-blue)] hover:underline shrink-0">Home</Link>
              <span>/</span>
              <Link href="/complaints" className="text-[var(--gov-blue)] hover:underline shrink-0">My Complaints</Link>
              <span>/</span>
              <span className="text-gray-700 truncate">Details</span>
            </nav>
            <span className="self-start bg-blue-100/70 text-[var(--gov-blue)] font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-blue-200 shrink-0 max-w-full truncate">
              RECORD ID: {id}
            </span>
          </div>

          <ComplaintDetails complaintId={id} profile={profile} />
        </div>
      </main>
      <Footer />
    </>
  );
}
