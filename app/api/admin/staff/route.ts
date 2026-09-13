import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/get-session';
import { apiError, apiSuccess } from '@/lib/utils';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase.from('profiles').select('id, name, email').eq('role', 'ADMIN').order('name');
    if (error) return apiError('Unable to load staff.', 500);
    return apiSuccess(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') return apiError('Authentication required.', 401);
    if (message === 'FORBIDDEN') return apiError('Admin access required.', 403);
    return apiError('Internal server error.', 500);
  }
}
