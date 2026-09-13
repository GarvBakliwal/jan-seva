import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/get-session';
import { apiError, apiSuccess } from '@/lib/utils';

export async function GET() {
  try {
    const session = await requireSession();
    const supabase = await createClient();
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', session.id).order('created_at', { ascending: false }).limit(30);
    if (error) return apiError('Unable to load notifications.', 500);
    return apiSuccess(data ?? []);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') return apiError('Authentication required.', 401);
    return apiError('Internal server error.', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown): id is string => typeof id === 'string') : [];
    if (!ids.length) return apiError('Notification IDs are required.', 400);
    const supabase = await createClient();
    const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', session.id).in('id', ids);
    if (error) return apiError('Unable to update notifications.', 500);
    return apiSuccess({ updated: ids.length });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') return apiError('Authentication required.', 401);
    return apiError('Internal server error.', 500);
  }
}
