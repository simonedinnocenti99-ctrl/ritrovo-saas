alter table public.invitations
  drop constraint if exists invitations_organization_id_email_status_key;

create unique index if not exists invitations_pending_group_email
  on public.invitations (organization_id, group_id, email)
  where status = 'pending' and group_id is not null;

create unique index if not exists invitations_pending_activity_email
  on public.invitations (organization_id, activity_id, email)
  where status = 'pending' and activity_id is not null;
