import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/get-session';
import { createComplaintSchema } from '@/lib/validations/complaint';
import { generateComplaintNumber, apiError, apiSuccess } from '@/lib/utils';

// POST /api/complaints — Create a new complaint
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();

    const parsed = createComplaintSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const supabase = await createClient();

    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        complaint_number: generateComplaintNumber(),
        user_id: session.id,
        category: data.category,
        description: data.description,
        image_url: data.image_url || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        address: data.address || null,
        landmark: data.landmark || null,
        additional_comments: data.additional_comments || null,
        status: 'REPORTED',
      })
      .select()
      .single();

    if (error) {
      console.error('Insert complaint error:', error);
      return apiError('Failed to submit complaint. Please try again.', 500);
    }

    return apiSuccess(complaint, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'UNAUTHORIZED') return apiError('Authentication required.', 401);
    console.error('POST /api/complaints error:', err);
    return apiError('Internal server error.', 500);
  }
}

// GET /api/complaints — Citizen's own complaints
export async function GET(request: NextRequest) {
  try {
    if (new URL(request.url).searchParams.get('public') === '1') {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc('get_public_complaints');
      if (error) return apiError('Unable to load public complaints.', 500);
      return apiSuccess(data ?? []);
    }
    const session = await requireSession();
    const supabase = await createClient();

    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', session.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch complaints error:', error);
      return apiError('Failed to fetch complaints.', 500);
    }

    return apiSuccess(complaints ?? []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'UNAUTHORIZED') return apiError('Authentication required.', 401);
    return apiError('Internal server error.', 500);
  }
}
