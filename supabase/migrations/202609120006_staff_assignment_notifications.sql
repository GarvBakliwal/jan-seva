-- Notify citizens when a specific staff member is assigned.
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
  elsif new.assigned_to is distinct from old.assigned_to then
    insert into public.notifications (user_id, complaint_id, type, title, body)
    values (new.user_id, new.id, 'ASSIGNMENT_CHANGED', 'Officer assigned', 'An officer has been assigned to complaint ' || new.complaint_number || '.');
  elsif new.assigned_department is distinct from old.assigned_department then
    insert into public.notifications (user_id, complaint_id, type, title, body)
    values (new.user_id, new.id, 'ASSIGNMENT_CHANGED', 'Department assigned', 'Complaint ' || new.complaint_number || ' was assigned to ' || coalesce(new.assigned_department, 'a municipal department') || '.');
  end if;
  return new;
end;
$$;
