import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/get-session';
import { updateStatusSchema } from '@/lib/validations/complaint';
import { apiError, apiSuccess } from '@/lib/utils';

// PATCH /api/admin/complaints/[id]/status — Update status + admin remarks
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { status, admin_remarks, priority, assigned_department, assigned_to } = parsed.data;
    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from('complaints')
      .update({
        status,
        admin_remarks: admin_remarks || null,
        ...(priority ? { priority } : {}),
        ...(assigned_department !== undefined ? { assigned_department: assigned_department || null } : {}),
        ...(assigned_to !== undefined ? { assigned_to } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      return apiError('Failed to update complaint status.', 500);
    }

    return apiSuccess(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Authentication required.', 401);
    if (msg === 'FORBIDDEN') return apiError('Admin access required.', 403);
    return apiError('Internal server error.', 500);
  }
}
