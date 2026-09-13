import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/profile';

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile;
}

/**
 * Returns the authenticated user + their profile.
 * Verifies auth server-side — NEVER trusts client-sent role claims.
 *
 * Returns null if the user is not authenticated or profile is missing.
 */
export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    id: user.id,
    email: user.email ?? '',
    profile: profile as Profile,
  };
}

/**
 * Returns the session and throws a 401-safe object if unauthenticated.
 * Use inside Route Handlers.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

/**
 * Returns the session if the user is an ADMIN.
 * Throws if not authenticated or not admin.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireSession();
  if (session.profile.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return session;
}
