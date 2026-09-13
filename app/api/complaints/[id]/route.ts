import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/get-session';
import { apiError, apiSuccess } from '@/lib/utils';

// GET /api/complaints/[id] — Citizen's own complaint by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const supabase = await createClient();

    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('*, complaint_status_history(*)')
      .eq('id', id)
      .eq('user_id', session.id)  // IMPORTANT: enforce ownership server-side
      .single();

    if (error || !complaint) {
      return apiError('Complaint not found.', 404);
    }

    return apiSuccess(complaint);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Authentication required.', 401);
    return apiError('Internal server error.', 500);
  }
}
