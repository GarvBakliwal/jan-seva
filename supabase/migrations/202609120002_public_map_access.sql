-- Public map access is deliberately sanitized: no descriptions, addresses, or user IDs.
create or replace function public.get_public_complaints()
returns table (
  id uuid,
  category public.complaint_category,
  status public.complaint_status,
  latitude double precision,
  longitude double precision,
  created_at timestamptz
)
language sql stable security definer set search_path = public
as $$
  select c.id, c.category, c.status,
    round(c.latitude::numeric, 2)::double precision,
    round(c.longitude::numeric, 2)::double precision,
    c.created_at
  from public.complaints c
  where c.latitude is not null and c.longitude is not null
  order by c.created_at desc
  limit 100;
$$;

revoke all on function public.get_public_complaints() from public;
grant execute on function public.get_public_complaints() to anon, authenticated;
