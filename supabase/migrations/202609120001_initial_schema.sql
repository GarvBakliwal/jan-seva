-- Jan Seva: initial production schema, access policies, and complaint audit trail.
create extension if not exists pgcrypto;

create type public.user_role as enum ('CITIZEN', 'ADMIN');
create type public.complaint_category as enum ('POTHOLE', 'GARBAGE', 'STREETLIGHT', 'WATER_LEAKAGE', 'DRAINAGE', 'PUBLIC_INFRASTRUCTURE', 'OTHER');
create type public.complaint_status as enum ('REPORTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  email text not null,
  phone text,
  role public.user_role not null default 'CITIZEN',
  created_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_number text not null unique default ('JS-' || to_char(current_date, 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category public.complaint_category not null,
  description text not null check (char_length(description) between 10 and 500),
  image_url text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  address text check (char_length(address) <= 300),
  landmark text check (char_length(landmark) <= 200),
  additional_comments text check (char_length(additional_comments) <= 500),
  status public.complaint_status not null default 'REPORTED',
  admin_remarks text check (char_length(admin_remarks) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((latitude is null and longitude is null) or (latitude is not null and longitude is not null))
);

create table public.complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  status public.complaint_status not null,
  remarks text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index complaints_user_created_idx on public.complaints(user_id, created_at desc);
create index complaints_status_created_idx on public.complaints(status, created_at desc);
create index complaints_category_created_idx on public.complaints(category, created_at desc);
create index complaint_history_complaint_created_idx on public.complaint_status_history(complaint_id, created_at asc);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)), new.email, nullif(new.raw_user_meta_data ->> 'phone', ''));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_complaint_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger complaints_set_updated_at before update on public.complaints for each row execute procedure public.set_complaint_updated_at();

create or replace function public.record_complaint_status() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status or new.admin_remarks is distinct from old.admin_remarks then
    insert into public.complaint_status_history (complaint_id, status, remarks, changed_by) values (new.id, new.status, new.admin_remarks, auth.uid());
  end if;
  return new;
end;
$$;
create trigger complaints_record_status after insert or update on public.complaints for each row execute procedure public.record_complaint_status();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN');
$$;

alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_status_history enable row level security;
create policy "Profiles are visible to their owner or admins" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "Citizens can update their own contact profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = 'CITIZEN');
create policy "Citizens can read their complaints; admins can read all" on public.complaints for select using (user_id = auth.uid() or public.is_admin());
create policy "Citizens can lodge their own complaints" on public.complaints for insert with check (user_id = auth.uid() and status = 'REPORTED');
create policy "Admins can update complaints" on public.complaints for update using (public.is_admin()) with check (public.is_admin());
create policy "Complaint history is visible to owners and admins" on public.complaint_status_history for select using (public.is_admin() or exists (select 1 from public.complaints c where c.id = complaint_id and c.user_id = auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('complaint-images', 'complaint-images', true, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "Users can upload their own complaint images" on storage.objects for insert to authenticated with check (bucket_id = 'complaint-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete their own complaint images" on storage.objects for delete to authenticated using (bucket_id = 'complaint-images' and (storage.foldername(name))[1] = auth.uid()::text);
