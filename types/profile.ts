export type UserRole = 'CITIZEN' | 'ADMIN';

export interface Profile {
  id: string;           // References auth.users(id)
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
}
