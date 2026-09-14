import React from 'react';
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

export default function ComplaintCard({
  complaint,
  href,
  showUser = false,
}: ComplaintCardProps): React.JSX.Element {
  const categoryLabel = CATEGORY_LABELS[complaint.category] ?? 'General';
  const categoryIcon = CATEGORY_ICONS[complaint.category] ?? '📋';

  return (
    <Link
      href={href}
      className="block card card-hover focus-visible:ring-2 focus-visible:ring-[var(--gov-blue)] focus-visible:outline-none rounded-xl p-3 bg-white border border-gray-200 transition-all hover:shadow-md"
      aria-label={`Complaint ${complaint.complaint_number} - ${categoryLabel}`}
    >
      <div className="flex gap-3 items-start">
        {/* Thumbnail */}
        <div
          className="shrink-0 w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center relative bg-[var(--gov-blue-50)] border border-gray-200"
        >
          {complaint.image_url ? (
            <Image
              src={complaint.image_url}
              alt={`Photo for complaint ${complaint.complaint_number}`}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-2xl select-none" role="img" aria-label={categoryLabel}>
              {categoryIcon}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span
              className="text-xs font-semibold font-mono"
              style={{ color: 'var(--gov-blue)' }}
            >
              #{complaint.complaint_number}
            </span>
            <StatusBadge status={complaint.status} size="sm" />
          </div>

          <p
            className="text-xs font-semibold mb-1"
            style={{ color: 'var(--gov-saffron)' }}
          >
            {categoryLabel}
          </p>

          <p className="text-sm mb-2 text-gray-700 line-clamp-2 leading-snug">
            {truncate(complaint.description, 90)}
          </p>

          {showUser && complaint.profiles?.name && (
            <p className="text-xs mb-1 text-gray-500 truncate">
              👤 {complaint.profiles.name}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1 shrink-0">
              <Calendar size={12} aria-hidden="true" />
              {formatDate(complaint.created_at)}
            </span>
            {complaint.address && (
              <span className="flex items-center gap-1 truncate max-w-[140px]" title={complaint.address}>
                <MapPin size={12} aria-hidden="true" className="shrink-0" />
                {truncate(complaint.address, 30)}
              </span>
            )}
          </div>
        </div>

        {/* Chevron Arrow */}
        <ArrowRight
          size={16}
          className="shrink-0 self-center text-gray-400 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}