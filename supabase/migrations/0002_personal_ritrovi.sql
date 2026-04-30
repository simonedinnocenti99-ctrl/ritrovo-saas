alter table public.activities alter column group_id drop not null;

create or replace function public.can_read_activity(activity uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.activities a
    where a.id = activity
      and (
        a.created_by = auth.uid()
        or (a.group_id is not null and public.is_group_member(a.group_id))
        or exists (
          select 1
          from public.activity_participants p
          where p.activity_id = a.id and p.user_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.can_manage_activity(activity uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.activities a
    where a.id = activity
      and (
        a.created_by = auth.uid()
        or (a.group_id is not null and public.is_group_manager(a.group_id))
      )
  );
$$;

drop policy if exists "Group members read activities" on public.activities;
drop policy if exists "Group managers create activities" on public.activities;
drop policy if exists "Group managers update activities" on public.activities;
drop policy if exists "Group managers delete activities" on public.activities;

create policy "Users read relevant activities" on public.activities for select to authenticated using (public.can_read_activity(id));
create policy "Users create personal or group activities" on public.activities for insert to authenticated with check (
  created_by = auth.uid()
  and public.is_org_member(organization_id)
  and (
    group_id is null
    or public.is_group_manager(group_id)
  )
);
create policy "Owners or group managers update activities" on public.activities for update to authenticated using (public.can_manage_activity(id)) with check (public.can_manage_activity(id));
create policy "Owners or group managers delete activities" on public.activities for delete to authenticated using (public.can_manage_activity(id));

drop policy if exists "Group members read participants" on public.activity_participants;
drop policy if exists "Managers manage participants" on public.activity_participants;
drop policy if exists "Participants update own RSVP" on public.activity_participants;
drop policy if exists "Members add own RSVP" on public.activity_participants;

create policy "Users read relevant participants" on public.activity_participants for select to authenticated using (public.can_read_activity(activity_id));
create policy "Owners or group managers manage participants" on public.activity_participants for all to authenticated using (public.can_manage_activity(activity_id)) with check (public.can_manage_activity(activity_id));
create policy "Participants update own RSVP" on public.activity_participants for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users add own RSVP to readable activities" on public.activity_participants for insert to authenticated with check (user_id = auth.uid() and public.can_read_activity(activity_id));

drop policy if exists "Group members read photos" on public.activity_photos;
drop policy if exists "Members upload photos" on public.activity_photos;
drop policy if exists "Uploader or manager deletes photos" on public.activity_photos;

create policy "Users read relevant photos" on public.activity_photos for select to authenticated using (public.can_read_activity(activity_id));
create policy "Users upload photos to relevant activities" on public.activity_photos for insert to authenticated with check (uploaded_by = auth.uid() and public.can_read_activity(activity_id));
create policy "Uploader or activity manager deletes photos" on public.activity_photos for delete to authenticated using (uploaded_by = auth.uid() or public.can_manage_activity(activity_id));

drop policy if exists "Group members read availability" on public.availability_options;
drop policy if exists "Managers manage availability options" on public.availability_options;
drop policy if exists "Group members read availability responses" on public.availability_responses;

create policy "Users read relevant availability" on public.availability_options for select to authenticated using (public.can_read_activity(activity_id));
create policy "Owners or group managers manage availability options" on public.availability_options for all to authenticated using (public.can_manage_activity(activity_id)) with check (public.can_manage_activity(activity_id));
create policy "Users read relevant availability responses" on public.availability_responses for select to authenticated using (
  exists (
    select 1 from public.availability_options o
    where o.id = option_id and public.can_read_activity(o.activity_id)
  )
);

drop policy if exists "Group members read polls" on public.polls;
drop policy if exists "Managers manage polls" on public.polls;
drop policy if exists "Group members read poll options" on public.poll_options;
drop policy if exists "Managers manage poll options" on public.poll_options;
drop policy if exists "Group members read poll votes" on public.poll_votes;
drop policy if exists "Members vote as themselves" on public.poll_votes;

create policy "Users read relevant polls" on public.polls for select to authenticated using (public.can_read_activity(activity_id));
create policy "Owners or group managers manage polls" on public.polls for all to authenticated using (public.can_manage_activity(activity_id)) with check (public.can_manage_activity(activity_id));
create policy "Users read relevant poll options" on public.poll_options for select to authenticated using (
  exists (select 1 from public.polls p where p.id = poll_id and public.can_read_activity(p.activity_id))
);
create policy "Owners or group managers manage poll options" on public.poll_options for all to authenticated using (
  exists (select 1 from public.polls p where p.id = poll_id and public.can_manage_activity(p.activity_id))
) with check (
  exists (select 1 from public.polls p where p.id = poll_id and public.can_manage_activity(p.activity_id))
);
create policy "Users read relevant poll votes" on public.poll_votes for select to authenticated using (
  exists (select 1 from public.polls p where p.id = poll_id and public.can_read_activity(p.activity_id))
);
create policy "Users vote as themselves on relevant polls" on public.poll_votes for insert to authenticated with check (
  user_id = auth.uid()
  and exists (select 1 from public.polls p where p.id = poll_id and p.status = 'open' and public.can_read_activity(p.activity_id))
);

drop policy if exists "Members can read activity photo objects" on storage.objects;
create policy "Users can read relevant activity photo objects" on storage.objects for select to authenticated using (
  bucket_id = 'activity-photos' and exists (
    select 1
    from public.activity_photos p
    where p.storage_path = name and public.can_read_activity(p.activity_id)
  )
);
