-- In-app notifications for citizen-visible complaint changes.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  complaint_id uuid references public.complaints(id) on delete cascade,
  type text not null check (type in ('COMPLAINT_CREATED', 'STATUS_CHANGED', 'ASSIGNMENT_CHANGED')),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
alter table public.notifications enable row level security;
create policy "Users can read their notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Users can mark their notifications read" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.notify_complaint_owner()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, complaint_id, type, title, body)
    values (new.user_id, new.id, 'COMPLAINT_CREATED', 'Complaint submitted', 'Your complaint ' || new.complaint_number || ' was submitted successfully.');
  elsif new.status is distinct from old.status then
    insert into public.notifications (user_id, complaint_id, type, title, body)
    values (new.user_id, new.id, 'STATUS_CHANGED', 'Complaint status updated', 'Complaint ' || new.complaint_number || ' is now ' || replace(initcap(lower(new.status::text)), '_', ' ') || '.');
  elsif new.assigned_department is distinct from old.assigned_department then
    insert into public.notifications (user_id, complaint_id, type, title, body)
    values (new.user_id, new.id, 'ASSIGNMENT_CHANGED', 'Complaint assigned', 'Complaint ' || new.complaint_number || ' was assigned to ' || coalesce(new.assigned_department, 'a municipal department') || '.');
  end if;
  return new;
end;
$$;

drop trigger if exists complaints_notify_owner on public.complaints;
create trigger complaints_notify_owner after insert or update of status, assigned_department on public.complaints
  for each row execute procedure public.notify_complaint_owner();
