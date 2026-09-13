import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import HomeMapWrapper from './HomeMapWrapper';
import {
  MapPin,
  CheckCircle2,
  ChevronRight,
  Search,
  Building,
  Droplets,
  Zap,
  Waves,
  Construction,
  HelpCircle,
  Share2,
  Megaphone,
  Check,
  Mail,
  Eye,
  PhoneCall,
  Layers,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import { formatDate } from '@/lib/utils';
import type { ComplaintStatus, ComplaintCategory } from '@/types/complaint';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';

type PublicComplaint = {
  id: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  latitude: number;
  longitude: number;
  created_at: string;
};

type PortalStats = {
  total_reports: number;
  resolved_reports: number;
  under_review_reports: number;
  in_progress_reports: number;
};

export const metadata: Metadata = {
  title: 'Jan Seva — Report Civic Issues, Improve Your Community',
  description: 'Report potholes, garbage, damaged streetlights, water leakage and other civic issues directly to concerned authorities.',
};


const CITIZEN_SERVICES = [
  {
    title: 'Report an Issue',
    desc: 'Submit a new complaint with photo and location',
    icon: Mail,
    href: '/report',
    color: 'bg-blue-900 text-white',
  },
  {
    title: 'Track Complaint',
    desc: 'Check the real-time status of your complaint',
    icon: Search,
    href: '/complaints',
    color: 'bg-blue-900 text-white',
  },
  {
    title: 'View Reported Issues',
    desc: 'Explore civic issues reported near your area',
    icon: Eye,
    href: '#explore',
    color: 'bg-blue-900 text-white',
  },
  {
    title: 'Important Contacts',
    desc: 'Emergency municipal public service contacts',
    icon: PhoneCall,
    href: '#contacts',
    color: 'bg-blue-900 text-white',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Report',
    badgeText: 'Step 1',
    desc: 'Submit the issue with photo and description',
    badgeBg: 'bg-blue-900 text-white',
  },
  {
    step: '02',
    title: 'Locate',
    badgeText: 'Step 2',
    desc: 'Your location helps identify where the issue occurred',
    badgeBg: 'bg-indigo-700 text-white',
  },
  {
    step: '03',
    title: 'Resolve',
    badgeText: 'Step 3',
    desc: 'The concerned authority reviews and works on the issue',
    badgeBg: 'bg-slate-900 text-white',
  },
  {
    step: '04',
    title: 'Track',
    badgeText: 'Final',
    desc: 'Track progress until the issue is resolved',
    badgeBg: 'bg-emerald-600 text-white',
  },
];

const CATEGORIES = [
  {
    key: 'POTHOLE',
    name: 'Potholes & Roads',
    sub: 'Damaged lanes, craters',
    count: '214 open',
    icon: Construction,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    key: 'GARBAGE',
    name: 'Garbage & Sanitation',
    sub: 'Dumps, overflowing bins',
    count: '178 open',
    icon: Building,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    key: 'STREETLIGHT',
    name: 'Streetlights',
    sub: 'Non-functional, dark spots',
    count: '94 open',
    icon: Zap,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    key: 'WATER_LEAKAGE',
    name: 'Water Leakage',
    sub: 'Pipe bursts, supply issues',
    count: '132 open',
    icon: Droplets,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    key: 'DRAINAGE',
    name: 'Drainage',
    sub: 'Clogged systems, flood',
    count: '74 open',
    icon: Waves,
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
  },
  {
    key: 'PUBLIC_INFRASTRUCTURE',
    name: 'Public Infra',
    sub: 'Parks, walkways, footpaths',
    count: '210 open',
    icon: Layers,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const session = await getSession();
  if (session?.profile.role === 'ADMIN') redirect('/admin');
  const [{ data: publicComplaints }, { data: portalStats }] = await Promise.all([
    supabase.rpc('get_public_complaints'),
    supabase.rpc('get_public_portal_stats'),
  ]);
  const liveComplaints = (publicComplaints ?? []) as PublicComplaint[];
  const stats = (portalStats?.[0] ?? null) as PortalStats | null;
  const categoryCounts = liveComplaints.reduce<Record<string, number>>((counts, complaint) => {
    counts[complaint.category] = (counts[complaint.category] ?? 0) + 1;
    return counts;
  }, {});
  const citizenReportCount = stats?.total_reports ?? liveComplaints.length;
  const resolvedCount = stats?.resolved_reports ?? liveComplaints.filter((complaint) => complaint.status === 'RESOLVED').length;
  const reviewCount = stats?.under_review_reports ?? liveComplaints.filter((complaint) => complaint.status === 'UNDER_REVIEW').length;
  return (
    <>
      <Header profile={session?.profile} />

      <main id="main-content" className="bg-slate-50 min-h-screen text-gray-900 pb-16 md:pb-0">
        {/* ================= HERO SECTION ================= */}
        <section aria-labelledby="hero-title" className="bg-white border-b border-gray-200 pt-6 pb-8">
          <div className="container-gov max-w-lg mx-auto px-4">
            {/* Title & Headline */}
            <h1 id="hero-title" className="text-2xl sm:text-3xl font-extrabold text-[var(--gov-navy)] leading-tight tracking-tight mb-3">
              Report Civic Issues.<br />
              <span className="text-[var(--gov-navy)]">Improve Your Community.</span>
            </h1>

            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Report potholes, garbage, damaged streetlights, water leakage and other civic issues directly to the concerned authorities.
            </p>

            {/* Primary Action Buttons */}
            <div className="space-y-3 mb-6">
              <Link
                href="/report"
                className="report-cta w-full py-3.5 px-5 rounded-xl text-base shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Megaphone size={18} className="text-[var(--gov-saffron)]" />
                <span>Report an Issue</span>
              </Link>

              <Link
                href="/complaints"
                className="w-full py-3 px-5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm border border-gray-300 transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
              >
                <Search size={16} className="text-gray-500" />
                <span>Track Your Complaint</span>
              </Link>
            </div>

            {/* Value Pillars List */}
            <div className="flex items-center justify-between text-[11px] text-gray-600 font-medium py-2 border-y border-gray-100 mb-6">
              <span className="flex items-center gap-1">
                <Check size={12} className="text-emerald-600 font-bold" /> Direct
              </span>
              <span className="flex items-center gap-1">
                <Check size={12} className="text-emerald-600 font-bold" /> Transparent
              </span>
              <span className="flex items-center gap-1">
                <Check size={12} className="text-emerald-600 font-bold" /> Location Aware
              </span>
              <span className="flex items-center gap-1">
                <Check size={12} className="text-emerald-600 font-bold" /> Action Driven
              </span>
            </div>

            {/* Hero Image Feature Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-gray-900 group">
              <div className="relative h-64 w-full">
                <Image
                  src="/images/hero_pothole_reporting.jpg"
                  alt="Citizen reporting pothole issue on urban street"
                  fill
                  sizes="(max-width: 640px) 100vw, 500px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />

                {/* Orange Badge Tag */}
                <div className="absolute top-3 right-3 bg-[var(--gov-saffron)] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
                  LIVE ISSUE FROM GOA
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-3 text-white">
                  <div>
                    <p className="text-xs font-semibold leading-snug max-w-[240px] text-gray-100">
                      Urban road repair and maintenance for municipal sector
                    </p>
                  </div>
                  <Link
                    href="#explore"
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-[11px] font-semibold text-white border border-white/30 transition-all flex items-center gap-1 shrink-0"
                  >
                    <span>See Your City</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CITIZEN SERVICES SECTION ================= */}
        <section className="py-8 bg-slate-50 border-b border-gray-200">
          <div className="container-gov max-w-lg mx-auto px-4">
            <h2 className="text-xl font-bold text-[var(--gov-navy)] mb-1">Citizen Services</h2>
            <p className="text-xs text-gray-500 mb-4">Access core municipal redressal services</p>

            <div className="space-y-3">
              {CITIZEN_SERVICES.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-center gap-3.5 p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--gov-navy)] text-white flex items-center justify-center shrink-0 group-hover:bg-[var(--gov-blue)] transition-colors">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-[var(--gov-blue)] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS SECTION ================= */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="container-gov max-w-lg mx-auto px-4">
            <h2 className="text-xl font-bold text-[var(--gov-navy)] mb-1">How It Works</h2>
            <p className="text-xs text-gray-500 mb-5">Simple 4-step workflow from complaint lodging to verification</p>

            <div className="space-y-3">
              {HOW_IT_WORKS.map((step) => (
                <div
                  key={step.step}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl border border-gray-200/80 bg-slate-50/60"
                >
                  <div className={`w-8 h-8 rounded-lg ${step.badgeBg} font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-200/70 px-2 py-0.5 rounded">
                        {step.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= WHAT CAN YOU REPORT? SECTION ================= */}
        <section className="py-8 bg-slate-50 border-b border-gray-200">
          <div className="container-gov max-w-lg mx-auto px-4">
            <h2 className="text-xl font-bold text-[var(--gov-navy)] mb-1">What Can You Report?</h2>
            <p className="text-xs text-gray-500 mb-4">Select a category to report a municipal grievance</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.key}
                    href={`/report?category=${cat.key}`}
                    className="p-3.5 bg-white rounded-xl border border-gray-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div className={`w-8 h-8 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center`}>
                          <Icon size={18} />
                        </div>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {categoryCounts[cat.key] ?? 0} mapped
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 leading-tight mb-0.5">{cat.name}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{cat.sub}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Accordion / Expandable Item for Other Civic Issues */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                  <HelpCircle size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Other Civic Issues</h4>
                  <p className="text-[10px] text-gray-500">Stray animals, encroachments, noise violations</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>
        </section>

        {/* ================= PORTAL ACTIVITY & TRANSPARENCY SECTION ================= */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="container-gov max-w-lg mx-auto px-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white border border-blue-150 shadow-xs">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base font-bold text-[var(--gov-navy)] flex items-center gap-1.5">
                    <span>Portal Activity &amp; Transparency</span>
                  </h2>
                  <p className="text-[11px] text-gray-500">Real-time municipal status metrics</p>
                </div>
                <button title="Share metrics" className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-100/60 transition-colors">
                  <Share2 size={16} />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-white/80 rounded-xl border border-blue-100 shadow-2xs">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                    CITIZEN REPORTS
                  </span>
                  <div className="text-xl font-extrabold text-[var(--gov-navy)]">{citizenReportCount}</div>
                  <span className="text-[10px] text-gray-400">All citizen reports</span>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block mb-0.5">
                    RESOLVED ISSUES
                  </span>
                  <div className="text-xl font-extrabold text-emerald-600">{resolvedCount}</div>
                  <span className="text-[10px] text-emerald-700/80 font-medium">Resolved</span>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-amber-100 shadow-2xs">
                  <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block mb-0.5">
                    UNDER REVIEW
                  </span>
                  <div className="text-xl font-extrabold text-amber-600">{reviewCount}</div>
                  <span className="text-[10px] text-amber-700/80 font-medium">Under review</span>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider block mb-0.5">
                    CITIES COVERED
                  </span>
                  <div className="text-xl font-extrabold text-purple-700">1</div>
                  <span className="text-[10px] text-purple-700/80 font-medium">Active portal</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 pt-2 border-t border-blue-100/60">
                <CheckCircle2 size={12} className="text-blue-600" />
                <span>Updated daily as per municipal reporting standards</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RECENTLY REPORTED ISSUES SECTION ================= */}
        <section className="py-8 bg-slate-50 border-b border-gray-200">
          <div className="container-gov max-w-lg mx-auto px-4">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--gov-navy)]">Recently Reported Issues</h2>
                <p className="text-xs text-gray-500">Live citizen grievance feed across municipal zones</p>
              </div>
              <Link href="/complaints" className="text-xs font-semibold text-[var(--gov-blue)] hover:underline flex items-center gap-0.5 shrink-0">
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {liveComplaints.slice(0, 3).map((issue) => (
                <div key={issue.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {issue.category.replaceAll('_', ' ')}
                    </span>
                    <StatusBadge status={issue.status} size="sm" />
                  </div>

                    <h3 className="text-xs font-bold text-gray-900 leading-snug">
                    Civic issue reported in the mapped service area
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <MapPin size={12} className="shrink-0 text-red-500" />
                    <span className="truncate">Public map location</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                    <span>{formatDate(issue.created_at)}</span>
                    <span className="font-mono font-medium text-gray-500">Mapped report</span>
                  </div>
                </div>
              ))}
              {liveComplaints.length === 0 && <div className="p-6 bg-white rounded-xl border border-gray-200 text-center text-sm text-gray-500">No public issues with map locations yet.</div>}
            </div>
          </div>
        </section>

        {/* ================= CIVIC ISSUES NEAR YOU (MAP) SECTION ================= */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="container-gov max-w-lg mx-auto px-4">
            <h2 className="text-xl font-bold text-[var(--gov-navy)] mb-1">Civic Issues Near You</h2>
            <p className="text-xs text-gray-500 mb-4">Geographic distribution of municipal reports</p>

            <HomeMapWrapper />
          </div>
        </section>


        {/* ================= CALL TO ACTION BANNER SECTION ================= */}
        <section className="py-10 bg-gradient-to-br from-[var(--gov-navy)] via-[#0e2746] to-slate-900 text-white border-b border-gray-800">
          <div className="container-gov max-w-lg mx-auto px-4 text-center">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-tight">
              See a civic problem? Report it today.
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed mb-6 max-w-sm mx-auto">
              Your report can help authorities act swiftly and resolve issues to improve your neighborhood.
            </p>

            <div className="space-y-3">
              <Link
                href="/report"
                className="report-cta w-full py-3.5 px-5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Megaphone size={18} />
                <span>Report an Issue</span>
              </Link>

              <Link
                href="#helpline"
                className="w-full py-3 px-5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-xs border border-white/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <PhoneCall size={16} className="text-green-400" />
                <span>Talk to Governance Helpline</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
