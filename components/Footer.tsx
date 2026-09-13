import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, PhoneCall } from 'lucide-react';

export default function Footer() {
  // Keep the server and browser markup deterministic during hydration.
  const currentYear = 2026;

  return (
    <footer
      role="contentinfo"
      className="bg-[var(--gov-navy)] text-white relative pt-10 pb-16 md:pb-10"
    >
      {/* Saffron & Green Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" aria-hidden="true" />

      <div className="container-gov">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <Image src="/images/jan-seva-official-seal.svg" alt="Jan Seva official seal" width={40} height={40} className="w-10 h-10 shrink-0" />
              <div>
                <div className="font-bold text-lg leading-none tracking-tight">Jan Seva</div>
                <div className="text-white/60 text-xs mt-0.5 font-medium">Civic Resolution Portal</div>
              </div>
            </div>

            <p className="text-white/75 text-sm max-w-md leading-relaxed">
              Civic Resolution &amp; Engagement Platform — Built for responsive administration, transparent municipal tracking, and citizen empowerment across urban and rural bodies.
            </p>

            <div className="pt-1 flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1" suppressHydrationWarning>
                <ShieldCheck size={14} className="text-[var(--gov-saffron)]" /> Direct Municipal Access
              </span>
              <span className="flex items-center gap-1">
                <PhoneCall size={14} className="text-green-400" />
                Municipal Support Services
              </span>
            </div>
          </div>

          {/* Quick Links Column 1 */}
          <div className="md:col-span-3 space-y-2">
            <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#about" className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Report Issue</span>
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Track Status</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column 2 */}
          <div className="md:col-span-3 space-y-2">
            <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-3">
              Support &amp; Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#helpdesk" className="text-white/70 hover:text-white transition-colors">
                  Helpdesk
                </Link>
              </li>
              <li>
                <Link href="#privacy" className="text-white/70 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#terms" className="text-white/70 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Bar Box */}
        <div className="my-6 p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>National Portal for Municipal Grievance Redressal</span>
          </div>
          <span className="font-semibold text-white/90 bg-white/10 px-2.5 py-1 rounded text-[11px] border border-white/10">
            Built for Transparency
          </span>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-white/50 pt-2">
          <p>&copy; {currentYear} Jan Seva Portal. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
