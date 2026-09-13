import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import type { Complaint } from '@/types/complaint';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/complaint';
import StatusBadge from './StatusBadge';
import { formatDate, truncate } from '@/lib/utils';

interface ComplaintCardProps {
  complaint: Complaint;
  href: string;
  showUser?: boolean;
}

export default function ComplaintCard({ complaint, href, showUser = false }: ComplaintCardProps) {
  return (
    <Link
      href={href}
      className="block card card-hover focus-visible:ring-2 focus-visible:ring-[var(--gov-blue)] focus-visible:outline-none"
      aria-label={`${complaint.complaint_number} — ${CATEGORY_LABELS[complaint.category]}`}
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div
          className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden"
          style={{ background: 'var(--gov-blue-50)', border: '1px solid var(--gray-200)' }}
        >
          {complaint.image_url ? (
            <Image
              src={complaint.image_url}
              alt={`Photo for complaint ${complaint.complaint_number}`}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {CATEGORY_ICONS[complaint.category]}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span
              className="text-xs font-semibold font-mono"
              style={{ color: 'var(--gov-blue)' }}
            >
              {complaint.complaint_number}
            </span>
            <StatusBadge status={complaint.status} size="sm" />
          </div>

          <p
            className="text-xs font-medium mb-1"
            style={{ color: 'var(--gov-saffron)' }}
          >
            {CATEGORY_LABELS[complaint.category]}
          </p>

          <p className="text-sm mb-2" style={{ color: 'var(--gray-700)' }}>
            {truncate(complaint.description, 90)}
          </p>

          {showUser && complaint.profiles && (
            <p className="text-xs mb-1" style={{ color: 'var(--gray-500)' }}>
              👤 {complaint.profiles.name}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--gray-500)' }}>
            <span className="flex items-center gap-1">
              <Calendar size={11} aria-hidden="true" />
              {formatDate(complaint.created_at)}
            </span>
            {complaint.address && (
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <MapPin size={11} aria-hidden="true" />
                {truncate(complaint.address, 30)}
              </span>
            )}
          </div>
        </div>

        <ArrowRight
          size={16}
          className="flex-shrink-0 self-center"
          style={{ color: 'var(--gray-400)' }}
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
