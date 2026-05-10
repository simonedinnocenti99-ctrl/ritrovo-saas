alter table public.activities alter column group_id drop not null;

drop policy if exists "Users create personal or group activities" on public.activities;

create policy "Users create personal or group activities" on public.activities for insert to authenticated with check (
  created_by = auth.uid()
  and public.is_org_member(organization_id)
  and (
    group_id is null
    or public.is_group_member(group_id)
  )
);
