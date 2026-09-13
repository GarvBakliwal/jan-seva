import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminComplaintDetails from './AdminComplaintDetails';
import { requireAdmin } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Complaint Record | Authority Dashboard',
  description: 'Complete civic complaint record for authorized municipal staff.',
};

export default async function AdminComplaintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let session;
  try {
    session = await requireAdmin();
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') redirect(`/login?from=/admin/complaints/${id}`);
    redirect('/');
  }

  return (
    <>
      <Header profile={session.profile} />
      <main className="relative z-0 flex-1 bg-slate-50 py-6 pb-20 px-4 md:pb-12 text-gray-900">
        <div className="container-gov max-w-2xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-4 text-xs">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-gray-500">
              <Link href="/admin" className="text-[var(--gov-blue)] hover:underline">Authority Dashboard</Link>
              <span>/</span>
              <span className="text-gray-700">Complaint Details</span>
            </nav>
            <span className="bg-amber-100 text-amber-900 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-amber-200">ADMIN VIEW</span>
          </div>
          <AdminComplaintDetails complaintId={id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
