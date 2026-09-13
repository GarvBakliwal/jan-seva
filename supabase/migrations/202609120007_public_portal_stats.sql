-- Public, aggregate-only portal metrics. No complaint descriptions, addresses,
-- user IDs, or other private fields are exposed.
create or replace function public.get_public_portal_stats()
returns table (
  total_reports bigint,
  resolved_reports bigint,
  under_review_reports bigint,
  in_progress_reports bigint
)
language sql stable security definer set search_path = public
as $$
  select
    count(*)::bigint,
    count(*) filter (where status = 'RESOLVED')::bigint,
    count(*) filter (where status = 'UNDER_REVIEW')::bigint,
    count(*) filter (where status = 'IN_PROGRESS')::bigint
  from public.complaints;
$$;

revoke all on function public.get_public_portal_stats() from public;
grant execute on function public.get_public_portal_stats() to anon, authenticated;
