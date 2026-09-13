import { CheckCircle, Circle, Clock } from 'lucide-react';
import type { ComplaintStatus } from '@/types/complaint';
import { STATUS_ORDER, STATUS_LABELS } from '@/types/complaint';
import { formatDateTime } from '@/lib/utils';

interface ComplaintTimelineProps {
  currentStatus: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

export default function ComplaintTimeline({
  currentStatus,
  createdAt,
  updatedAt,
}: ComplaintTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div aria-label="Complaint status timeline">
      <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--gray-700)' }}>
        Status Timeline
      </h3>
      <ol className="relative" style={{ paddingLeft: '2rem' }}>
        {STATUS_ORDER.map((status, index) => {
          const isDone    = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li key={status} className="relative pb-6 last:pb-0">
              {/* Connector line */}
              {index < STATUS_ORDER.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[-1.25rem] top-5 bottom-0 w-0.5"
                  style={{
                    background: isDone
                      ? 'var(--gov-green)'
                      : 'var(--gray-200)',
                    marginLeft: '-1px',
                  }}
                />
              )}

              {/* Icon */}
              <span
                aria-hidden="true"
                className="absolute flex items-center justify-center"
                style={{
                  left: '-2rem',
                  top: '0',
                  width: '1.5rem',
                  height: '1.5rem',
                }}
              >
                {isDone ? (
                  <CheckCircle
                    size={22}
                    style={{ color: 'var(--gov-green)' }}
                    strokeWidth={2}
                  />
                ) : isCurrent ? (
                  <Clock
                    size={22}
                    style={{ color: 'var(--gov-blue)' }}
                    strokeWidth={2}
                  />
                ) : (
                  <Circle
                    size={22}
                    style={{ color: 'var(--gray-300)' }}
                    strokeWidth={1.5}
                  />
                )}
              </span>

              {/* Label */}
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{
                    color: isDone
                      ? 'var(--gov-green)'
                      : isCurrent
                      ? 'var(--gov-blue)'
                      : 'var(--gray-400)',
                  }}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {STATUS_LABELS[status]}
                  {isCurrent && (
                    <span
                      className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--gov-blue-50)', color: 'var(--gov-blue)' }}
                    >
                      Current
                    </span>
                  )}
                </p>
                {index === 0 && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>
                    Reported on {formatDateTime(createdAt)}
                  </p>
                )}
                {isCurrent && index > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>
                    Updated {formatDateTime(updatedAt)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
