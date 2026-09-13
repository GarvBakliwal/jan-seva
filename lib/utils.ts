/**
 * Generates a complaint number in format: JS-YYYY-XXXXXX
 * e.g. JS-2025-004821
 */
export function generateComplaintNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `JS-${year}-${random}`;
}

/**
 * Format a date string for display (e.g. "12 Sep 2025")
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date-time string (e.g. "12 Sep 2025, 3:45 PM")
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text to n characters with ellipsis
 */
export function truncate(text: string, n: number): string {
  return text.length > n ? text.slice(0, n) + '…' : text;
}

/**
 * Build a standard API error response
 */
export function apiError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/**
 * Build a standard API success response
 */
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ data }, { status });
}
