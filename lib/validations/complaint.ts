import { z } from 'zod';
import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@/types/complaint';

const ALLOWED_CATEGORIES: ComplaintCategory[] = [
  'POTHOLE',
  'GARBAGE',
  'STREETLIGHT',
  'WATER_LEAKAGE',
  'DRAINAGE',
  'PUBLIC_INFRASTRUCTURE',
  'OTHER',
];

const ALLOWED_STATUSES: ComplaintStatus[] = [
  'REPORTED',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
];

const ALLOWED_PRIORITIES: ComplaintPriority[] = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];

// ---- Create Complaint ----
export const createComplaintSchema = z.object({
  category: z.enum(ALLOWED_CATEGORIES as [ComplaintCategory, ...ComplaintCategory[]]),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.')
    .max(500, 'Description cannot exceed 500 characters.'),
  image_url: z.string().url().optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().max(300).optional().or(z.literal('')),
  landmark: z.string().max(200).optional().or(z.literal('')),
  additional_comments: z.string().max(500).optional().or(z.literal('')),
});

export type CreateComplaintSchema = z.infer<typeof createComplaintSchema>;

// ---- Update Status ----
export const updateStatusSchema = z.object({
  status: z.enum(ALLOWED_STATUSES as [ComplaintStatus, ...ComplaintStatus[]]),
  admin_remarks: z.string().max(1000).optional().or(z.literal('')),
  priority: z.enum(ALLOWED_PRIORITIES as [ComplaintPriority, ...ComplaintPriority[]]).optional(),
  assigned_department: z.string().max(150).optional().or(z.literal('')),
  assigned_to: z.string().uuid().nullable().optional(),
});

export type UpdateStatusSchema = z.infer<typeof updateStatusSchema>;

// ---- Register ----
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name cannot exceed 100 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password is too long.'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

// ---- Login ----
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
