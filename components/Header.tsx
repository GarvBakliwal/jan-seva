'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, User, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/types/profile';
import NotificationBell from '@/components/NotificationBell';
import { useNavigation } from '@/components/NavigationProvider';

interface HeaderProps {
  profile?: Profile | null;
}

export default function Header({ profile }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { links, mobileOpen, setMobileOpen } = useNavigation();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="gov-header" role="banner">
      {/* Main nav bar */}
      <div className="container-gov border-b border-white/10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={profile?.role === 'ADMIN' ? '/admin' : '/'}
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gov-saffron)] rounded py-1"
            aria-label={profile?.role === 'ADMIN' ? 'Jan Seva Authority Dashboard' : 'Jan Seva — Civic Resolution Portal Home'}
          >
            <Image src="/images/jan-seva-official-seal.svg" alt="Jan Seva official seal" width={44} height={44} className="w-11 h-11 shrink-0" priority />
            <div>
              <div className="text-white font-bold text-lg leading-none tracking-tight flex items-center gap-2">
                <span>जन सेवा</span>
                <span className="text-xs font-normal text-white/70 px-1.5 py-0.5 rounded bg-white/10 border border-white/15 hidden sm:inline-block">Civic Portal</span>
              </div>
              <div className="text-white/75 text-xs mt-0.5 font-medium">Jan Seva — Civic Resolution Portal</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/85 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {profile && (
              <NotificationBell />
            )}
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  id="user-menu-button"
                >
                  <User size={16} aria-hidden="true" />
                  <span className="hidden sm:block max-w-[120px] truncate">{profile.name}</span>
                  <ChevronDown size={14} aria-hidden="true" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 text-gray-800"
                    role="menu"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">{profile.name}</p>
                      <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                      <span
                        className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{
                          background: profile.role === 'ADMIN' ? 'var(--status-review-bg)' : 'var(--gov-blue-50)',
                          color: profile.role === 'ADMIN' ? 'var(--status-review)' : 'var(--gov-blue)',
                        }}
                      >
                        {profile.role}
                      </span>
                    </div>
                    {profile.role !== 'ADMIN' && (
                      <Link
                        href="/complaints"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Complaints
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      <LogOut size={14} aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-white/90 hover:text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn btn-saffron btn-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger toggle */}
            <button
              className="md:hidden text-white/90 hover:text-white p-2 rounded-md hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-header Initiative Banner */}
      <div className="bg-[var(--gov-navy-800)] border-b border-white/10 py-1.5">
        <div className="container-gov flex items-center justify-center gap-2 text-[11px] font-semibold text-white/90 uppercase tracking-widest text-center">
          <ShieldCheck size={14} className="text-[var(--gov-saffron)]" />
          <span>NATIONAL CIVIC GRIEVANCE REDRESSAL INITIATIVE</span>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--gov-navy-800)] border-b border-white/10" role="navigation" aria-label="Mobile navigation">
          <div className="container-gov py-3 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/80 hover:text-white hover:bg-white/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
