import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/get-session';
import { apiError, apiSuccess } from '@/lib/utils';

export const runtime = 'nodejs';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// POST /api/upload — Upload complaint image to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return apiError('No file provided.', 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError('Only JPG and PNG images are allowed.', 400);
    }

    if (file.size > MAX_SIZE_BYTES) {
      return apiError('Image must be smaller than 5 MB.', 400);
    }

    const supabase = await createClient();
    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
    };
    const ext = extensionByType[file.type] ?? file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `${session.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('complaint-images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      const message = process.env.NODE_ENV === 'development'
        ? `Image upload failed: ${uploadError.message}`
        : 'Failed to upload image. Please try again.';
      return apiError(message, 500);
    }

    const { data: urlData } = supabase.storage
      .from('complaint-images')
      .getPublicUrl(fileName);

    return apiSuccess({ url: urlData.publicUrl }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    console.error('Upload route error:', err);
    if (msg === 'UNAUTHORIZED') return apiError('Authentication required.', 401);
    const message = process.env.NODE_ENV === 'development' && msg
      ? `Image upload failed: ${msg}`
      : 'Internal server error.';
    return apiError(message, 500);
  }
}
