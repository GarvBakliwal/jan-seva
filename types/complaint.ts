// =========================================================
// JAN SEVA — Core Types
// SIH Problem Statement: SIH25031
// =========================================================

export type ComplaintStatus =
  | 'REPORTED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED';

export type ComplaintPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export type ComplaintCategory =
  | 'POTHOLE'
  | 'GARBAGE'
  | 'STREETLIGHT'
  | 'WATER_LEAKAGE'
  | 'DRAINAGE'
  | 'PUBLIC_INFRASTRUCTURE'
  | 'OTHER';

export interface Complaint {
  id: string;
  complaint_number: string;
  user_id: string;
  category: ComplaintCategory;
  description: string;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  landmark: string | null;
  additional_comments: string | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assigned_department: string | null;
  assigned_to: string | null;
  admin_remarks: string | null;
  created_at: string;
  updated_at: string;
  // Joined field from profiles
  profiles?: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface ComplaintWithProfile extends Complaint {
  profiles: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface CreateComplaintInput {
  category: ComplaintCategory;
  description: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  landmark?: string;
  additional_comments?: string;
}

export interface UpdateStatusInput {
  status: ComplaintStatus;
  admin_remarks?: string;
}

// ---- Display helpers ----

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  POTHOLE:              'Potholes & Roads',
  GARBAGE:              'Garbage & Sanitation',
  STREETLIGHT:          'Streetlights',
  WATER_LEAKAGE:        'Water Leakage',
  DRAINAGE:             'Drainage',
  PUBLIC_INFRASTRUCTURE:'Public Infrastructure',
  OTHER:                'Other Civic Issues',
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  REPORTED:     'Reported',
  UNDER_REVIEW: 'Under Review',
  IN_PROGRESS:  'In Progress',
  RESOLVED:     'Resolved',
};

export const STATUS_ORDER: ComplaintStatus[] = [
  'REPORTED',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
];

export const CATEGORY_ICONS: Record<ComplaintCategory, string> = {
  POTHOLE:              '🚗',
  GARBAGE:              '🗑️',
  STREETLIGHT:          '💡',
  WATER_LEAKAGE:        '💧',
  DRAINAGE:             '🌊',
  PUBLIC_INFRASTRUCTURE:'🏗️',
  OTHER:                '📋',
};
