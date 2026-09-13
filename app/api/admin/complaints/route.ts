import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/get-session';
import { apiError, apiSuccess } from '@/lib/utils';

// GET /api/admin/complaints — All complaints (admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const status   = searchParams.get('status');
    const category = searchParams.get('category');
    const search   = searchParams.get('search')?.replace(/[%,()]/g, '').trim();
    const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20') || 20));

    let query = supabase
      .from('complaints')
      .select('*, profiles!complaints_user_id_fkey(name, email, phone)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status)   query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (search) {
      query = query.or(
        `complaint_number.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`
      );
    }

    const { data: complaints, error, count } = await query;

    if (error) {
      console.error('Admin fetch complaints error:', error);
      return apiError('Failed to fetch complaints.', 500);
    }

    return apiSuccess({ items: complaints ?? [], page, limit, total: count ?? 0 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Authentication required.', 401);
    if (msg === 'FORBIDDEN') return apiError('Admin access required.', 403);
    return apiError('Internal server error.', 500);
  }
}
