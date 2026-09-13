interface LoadingStateProps {
  rows?: number;
  message?: string;
}

export default function LoadingState({ rows = 3, message }: LoadingStateProps) {
  return (
    <div role="status" aria-label={message ?? 'Loading…'} aria-busy="true">
      {message && (
        <p className="text-sm text-center mb-4" style={{ color: 'var(--gray-500)' }}>
          {message}
        </p>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="card flex gap-3"
            aria-hidden="true"
          >
            <div className="skeleton w-16 h-16 rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">{message ?? 'Loading…'}</span>
    </div>
  );
}
