import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReportForm from './ReportForm';
import type { Profile } from '@/types/profile';
import { getSession } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';


export const metadata: Metadata = {
  title: 'Report a Civic Issue | Jan Seva',
  description: 'Help improve your community by reporting a civic problem directly to municipal authorities.',
};

export default async function ReportPage() {
  const session = await getSession();
  if (!session) redirect('/login?from=/report');
  if (session.profile.role === 'ADMIN') redirect('/admin');
  const profile: Profile = session.profile;


  return (
    <>
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 py-6 px-4 pb-20 md:pb-12 text-gray-900">
        <div className="container-gov max-w-lg mx-auto">
          {/* Breadcrumb & Form Code Badge */}
          <div className="flex items-center justify-between gap-2 mb-3 text-xs">
            <nav aria-label="Breadcrumb" className="text-gray-500 flex items-center gap-1 font-medium">
              <Link href="/" className="text-[var(--gov-blue)] hover:underline">Home</Link>
              <span>/</span>
              <span className="text-gray-700">Report an Issue</span>
            </nav>
            <span className="bg-blue-100/70 text-[var(--gov-blue)] font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-blue-200">
              FORM 02-B
            </span>
          </div>

          {/* Title & Subtitle */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--gov-navy)] leading-tight">
              Report a Civic Issue
            </h1>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Help improve your community by reporting a civic problem directly to municipal authorities.
            </p>
          </div>

          {/* Public Notice Banner */}
          <div className="p-3.5 mb-5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-[10px]">ℹ</span>
              <span>Public Notice for Citizens</span>
            </div>
            <p className="text-blue-900/80 text-[11px] leading-relaxed">
              Please provide accurate information and location details so the concerned urban local body (ULB) or department can inspect and resolve the issue promptly under the Citizen Charter timeline.
            </p>
          </div>

          {/* Mandatory Indicator Bar */}
          <div className="flex items-center justify-between text-[11px] mb-4 pb-1">
            <span className="text-red-600 font-medium flex items-center gap-1">
              <span>!</span> Fields marked with asterisk (*) are mandatory
            </span>
            <span className="text-gray-400 font-medium">Page 1 of 1</span>
          </div>

          {/* Report Form */}
          <ReportForm profile={profile} />
        </div>
      </main>
      <Footer />
    </>
  );
}
