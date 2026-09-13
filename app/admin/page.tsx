import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminDashboard from './AdminDashboard';
import type { Profile } from '@/types/profile';
import { requireAdmin } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authority Dashboard | Jan Seva',
  description: 'Municipal grievance management, field crew dispatch, and real-time SLA compliance dashboard.',
};

export default async function AdminPage() {
  let session;
  try {
    session = await requireAdmin();
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      redirect('/login?from=/admin');
    }
    redirect('/');
  }
  if (!session) redirect('/');
  const adminProfile: Profile = session.profile;

  return (
    <>
      <Header profile={adminProfile} />
      <main className="flex-1 bg-slate-50 py-6 px-4 pb-20 md:pb-12 text-gray-900">
        <div className="container-gov max-w-lg mx-auto">
          {/* Breadcrumb & Officer Badge */}
          <div className="flex items-center justify-between gap-2 mb-3 text-xs">
            <nav aria-label="Breadcrumb" className="text-gray-500 flex items-center gap-1 font-medium">
              <Link href="/" className="text-[var(--gov-blue)] hover:underline">Home</Link>
              <span>/</span>
              <span className="text-gray-700">Authority Dashboard</span>
            </nav>
            <span className="bg-amber-100 text-amber-900 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-amber-200">
              OFFICER-AUTH
            </span>
          </div>

          <AdminDashboard profile={adminProfile} />
        </div>
      </main>
      <Footer />
    </>
  );
}
