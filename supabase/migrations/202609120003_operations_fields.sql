-- Operational fields for municipal triage and assignment.
alter table public.complaints
  add column if not exists priority text not null default 'NORMAL'
    check (priority in ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
  add column if not exists assigned_department text,
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null;

create index if not exists complaints_priority_idx on public.complaints(priority, created_at desc);
create index if not exists complaints_assigned_to_idx on public.complaints(assigned_to);
