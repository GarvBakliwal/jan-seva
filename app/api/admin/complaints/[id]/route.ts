import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/get-session';
import { apiError, apiSuccess } from '@/lib/utils';

// GET /api/admin/complaints/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createClient();

    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('*, profiles!complaints_user_id_fkey(name, email, phone), assigned_profile:profiles!complaints_assigned_to_fkey(name, email, phone), complaint_status_history(*)')
      .eq('id', id)
      .single();

    if (error || !complaint) return apiError('Complaint not found.', 404);
    return apiSuccess(complaint);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Authentication required.', 401);
    if (msg === 'FORBIDDEN') return apiError('Admin access required.', 403);
    return apiError('Internal server error.', 500);
  }
}
