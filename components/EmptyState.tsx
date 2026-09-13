import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  message,
  ctaLabel,
  ctaHref,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 px-4"
      role="status"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--gov-blue-50)' }}
        aria-hidden="true"
      >
        {icon ?? <AlertCircle size={28} style={{ color: 'var(--gov-blue)' }} />}
      </div>
      {title && (
        <h2
          className="font-semibold text-lg mb-2"
          style={{ color: 'var(--gray-900)' }}
        >
          {title}
        </h2>
      )}
      <p className="text-sm max-w-xs" style={{ color: 'var(--gray-500)' }}>
        {message}
      </p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="btn btn-primary mt-5">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
