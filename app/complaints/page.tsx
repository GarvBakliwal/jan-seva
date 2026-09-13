import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComplaintsList from './ComplaintsList';
import type { Profile } from '@/types/profile';
import { getSession } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Complaints | Jan Seva',
  description: 'Track real-time status, municipal field updates, and SLA milestones of issues submitted across your Urban Local Body.',
};

export default async function ComplaintsPage() {
  const session = await getSession();
  if (!session) redirect('/login?from=/complaints');
  if (session.profile.role === 'ADMIN') redirect('/admin');
  const profile: Profile = session.profile;

  return (
    <>
      <Header profile={profile} />
      <main className="relative z-0 flex-1 bg-slate-50 pt-8 pb-20 px-4 md:pb-12 text-gray-900">
        <div className="container-gov max-w-lg mx-auto">
          {/* Breadcrumbs & Form Code Badge */}
          <div className="flex items-center justify-between gap-2 mb-3 text-xs">
            <nav aria-label="Breadcrumb" className="text-gray-500 flex items-center gap-1 font-medium">
              <Link href="/" className="text-[var(--gov-blue)] hover:underline">Home</Link>
              <span>/</span>
              <span className="text-gray-700">My Complaints</span>
            </nav>
            <span className="bg-blue-100/70 text-[var(--gov-blue)] font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-blue-200">
              FORM DSH-01
            </span>
          </div>

          <ComplaintsList profile={profile} />
        </div>
      </main>
      <Footer />
    </>
  );
}
