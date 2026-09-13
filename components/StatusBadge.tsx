import type { ComplaintStatus } from '@/types/complaint';
import { STATUS_LABELS } from '@/types/complaint';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

const STATUS_DOT: Record<ComplaintStatus, string> = {
  REPORTED:     '#6B7280',
  UNDER_REVIEW: '#B45309',
  IN_PROGRESS:  '#1D4ED8',
  RESOLVED:     '#15803D',
};

const STATUS_CLASS: Record<ComplaintStatus, string> = {
  REPORTED:     'badge-reported',
  UNDER_REVIEW: 'badge-under-review',
  IN_PROGRESS:  'badge-in-progress',
  RESOLVED:     'badge-resolved',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const dotColor = STATUS_DOT[status];
  const cls = STATUS_CLASS[status];

  return (
    <span
      className={`badge ${cls}`}
      style={size === 'sm' ? { fontSize: '0.7rem', padding: '0.2rem 0.5rem' } : {}}
      aria-label={`Status: ${STATUS_LABELS[status]}`}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: dotColor }}
        aria-hidden="true"
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
