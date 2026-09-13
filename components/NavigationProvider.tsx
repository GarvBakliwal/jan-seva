'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { Home, LayoutDashboard, PlusCircle, Search, type LucideIcon } from 'lucide-react';
import type { UserRole } from '@/types/profile';

export type NavigationLink = { href: string; label: string; icon: LucideIcon };
type NavigationContextValue = { links: NavigationLink[]; mobileOpen: boolean; setMobileOpen: (open: boolean) => void };
const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ role, children }: { role?: UserRole; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = useMemo<NavigationLink[]>(() => role === 'ADMIN'
    ? [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }]
    : [{ href: '/', label: 'Home', icon: Home }, { href: '/report', label: 'Report', icon: PlusCircle }, { href: '/complaints', label: 'Track', icon: Search }], [role]);
  return <NavigationContext.Provider value={{ links, mobileOpen, setMobileOpen }}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used inside NavigationProvider');
  return context;
}
