create extension if not exists "pgcrypto";

create type public.member_role as enum ('owner', 'admin', 'member', 'guest');
create type public.activity_status as enum ('draft', 'planning', 'scheduled', 'completed', 'cancelled');
create type public.participant_status as enum ('invited', 'confirmed', 'declined', 'maybe');
create type public.availability_response_status as enum ('available', 'unavailable', 'maybe');
create type public.poll_status as enum ('open', 'closed');
create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  locale text not null default 'it',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  billing_plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  category text not null default 'Altro',
  status public.activity_status not null default 'planning',
  starts_at timestamptz,
  ends_at timestamptz,
  location_name text,
  location_address text,
  budget_min integer,
  budget_max integer,
  duration text,
  notes text,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_budget_order check (budget_min is null or budget_max is null or budget_min <= budget_max)
);

create table public.activity_participants (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  display_name text,
  email text,
  status public.participant_status not null default 'invited',
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (activity_id, user_id),
  constraint participant_identity check (user_id is not null or email is not null or display_name is not null)
);

create table public.activity_photos (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  caption text,
  created_at timestamptz not null default now()
);

create table public.availability_options (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  label text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint availability_time_order check (starts_at < ends_at)
);

create table public.availability_responses (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.availability_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.availability_response_status not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (option_id, user_id)
);

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  question text not null,
  status public.poll_status not null default 'open',
  allow_multiple boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now()
);

create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (option_id, user_id)
);

create table public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  input jsonb not null,
  output jsonb not null,
  created_activity_id uuid references public.activities(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete cascade,
  email text not null,
  role public.member_role not null default 'member',
  token uuid not null default gen_random_uuid(),
  status public.invitation_status not null default 'pending',
  invited_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  unique (organization_id, email, status)
);

create index idx_org_members_user on public.organization_members(user_id);
create index idx_group_members_user on public.group_members(user_id);
create index idx_groups_org on public.groups(organization_id);
create index idx_activities_group_status on public.activities(group_id, status, starts_at);
create index idx_participants_activity on public.activity_participants(activity_id);
create index idx_photos_activity on public.activity_photos(activity_id);
create index idx_availability_activity on public.availability_options(activity_id);
create index idx_polls_activity on public.polls(activity_id);
create index idx_invitations_email on public.invitations(email);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger groups_updated_at before update on public.groups for each row execute function public.set_updated_at();
create trigger activities_updated_at before update on public.activities for each row execute function public.set_updated_at();
create trigger participants_updated_at before update on public.activity_participants for each row execute function public.set_updated_at();
create trigger availability_responses_updated_at before update on public.availability_responses for each row execute function public.set_updated_at();
create trigger polls_updated_at before update on public.polls for each row execute function public.set_updated_at();

create or replace function public.is_org_member(org uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_manager(org uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org and user_id = auth.uid() and role in ('owner', 'admin')
  );
$$;

create or replace function public.is_group_member(grp uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = grp and user_id = auth.uid()
  );
$$;

create or replace function public.is_group_manager(grp uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = grp and user_id = auth.uid() and role in ('owner', 'admin')
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.activities enable row level security;
alter table public.activity_participants enable row level security;
alter table public.activity_photos enable row level security;
alter table public.availability_options enable row level security;
alter table public.availability_responses enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.ai_suggestions enable row level security;
alter table public.invitations enable row level security;

create policy "Profiles are visible to authenticated users" on public.profiles for select to authenticated using (true);
create policy "Users update their own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Users insert their own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

create policy "Members read organizations" on public.organizations for select to authenticated using (public.is_org_member(id) or created_by = auth.uid());
create policy "Authenticated users create organizations" on public.organizations for insert to authenticated with check (created_by = auth.uid());
create policy "Org managers update organizations" on public.organizations for update to authenticated using (public.is_org_manager(id)) with check (public.is_org_manager(id));

create policy "Members read org membership" on public.organization_members for select to authenticated using (public.is_org_member(organization_id));
create policy "Org managers manage org membership" on public.organization_members for all to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "Users can bootstrap own owner membership" on public.organization_members for insert to authenticated with check (
  user_id = auth.uid()
  and role = 'owner'
  and exists (select 1 from public.organizations o where o.id = organization_id and o.created_by = auth.uid())
);

create policy "Members read groups" on public.groups for select to authenticated using (public.is_org_member(organization_id));
create policy "Org managers create groups" on public.groups for insert to authenticated with check (public.is_org_manager(organization_id));
create policy "Group managers update groups" on public.groups for update to authenticated using (public.is_group_manager(id) or public.is_org_manager(organization_id)) with check (public.is_group_manager(id) or public.is_org_manager(organization_id));

create policy "Group members read membership" on public.group_members for select to authenticated using (public.is_group_member(group_id));
create policy "Group managers manage membership" on public.group_members for all to authenticated using (public.is_group_manager(group_id)) with check (public.is_group_manager(group_id));
create policy "Managers add group members" on public.group_members for insert to authenticated with check (
  public.is_group_manager(group_id)
  or exists (select 1 from public.groups g where g.id = group_id and public.is_org_manager(g.organization_id))
);

create policy "Group members read activities" on public.activities for select to authenticated using (public.is_group_member(group_id));
create policy "Group managers create activities" on public.activities for insert to authenticated with check (public.is_group_manager(group_id) and created_by = auth.uid());
create policy "Group managers update activities" on public.activities for update to authenticated using (public.is_group_manager(group_id)) with check (public.is_group_manager(group_id));
create policy "Group managers delete activities" on public.activities for delete to authenticated using (public.is_group_manager(group_id));

create policy "Group members read participants" on public.activity_participants for select to authenticated using (exists (select 1 from public.activities a where a.id = activity_id and public.is_group_member(a.group_id)));
create policy "Managers manage participants" on public.activity_participants for all to authenticated using (exists (select 1 from public.activities a where a.id = activity_id and public.is_group_manager(a.group_id))) with check (exists (select 1 from public.activities a where a.id = activity_id and public.is_group_manager(a.group_id)));
create policy "Participants update own RSVP" on public.activity_participants for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Members add own RSVP" on public.activity_participants for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.activities a where a.id = activity_id and public.is_group_member(a.group_id)));

create policy "Group members read photos" on public.activity_photos for select to authenticated using (exists (select 1 from public.activities a where a.id = activity_id and public.is_group_member(a.group_id)));
create policy "Members upload photos" on public.activity_photos for insert to authenticated with check (uploaded_by = auth.uid() and exists (select 1 from public.activities a where a.id = activity_id and public.is_group_member(a.group_id)));
create policy "Uploader or manager deletes photos" on public.activity_photos for delete to authenticated using (uploaded_by = auth.uid() or exists (select 1 from public.activities a where a.id = activity_id and public.is_group_manager(a.group_id)));

create policy "Group members read availability" on public.availability_options for select to authenticated using (exists (select 1 from public.activities a where a.id = activity_id and public.is_group_member(a.group_id)));
create policy "Managers manage availability options" on public.availability_options for all to authenticated using (exists (select 1 from public.activities a where a.id = activity_id and public.is_group_manager(a.group_id))) with check (exists (select 1 from public.activities a where a.id = activity_id and public.is_group_manager(a.group_id)));

create policy "Group members read availability responses" on public.availability_responses for select to authenticated using (exists (select 1 from public.availability_options o join public.activities a on a.id = o.activity_id where o.id = option_id and public.is_group_member(a.group_id)));
create policy "Members upsert own availability" on public.availability_responses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Group members read polls" on public.polls for select to authenticated using (exists (select 1 from public.activities a where a.id = activity_id and public.is_group_member(a.group_id)));
create policy "Managers manage polls" on public.polls for all to authenticated using (exists (select 1 from public.activities a where a.id = activity_id and public.is_group_manager(a.group_id))) with check (exists (select 1 from public.activities a where a.id = activity_id and public.is_group_manager(a.group_id)));
create policy "Group members read poll options" on public.poll_options for select to authenticated using (exists (select 1 from public.polls p join public.activities a on a.id = p.activity_id where p.id = poll_id and public.is_group_member(a.group_id)));
create policy "Managers manage poll options" on public.poll_options for all to authenticated using (exists (select 1 from public.polls p join public.activities a on a.id = p.activity_id where p.id = poll_id and public.is_group_manager(a.group_id))) with check (exists (select 1 from public.polls p join public.activities a on a.id = p.activity_id where p.id = poll_id and public.is_group_manager(a.group_id)));
create policy "Group members read poll votes" on public.poll_votes for select to authenticated using (exists (select 1 from public.polls p join public.activities a on a.id = p.activity_id where p.id = poll_id and public.is_group_member(a.group_id)));
create policy "Members vote as themselves" on public.poll_votes for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.polls p join public.activities a on a.id = p.activity_id where p.id = poll_id and p.status = 'open' and public.is_group_member(a.group_id)));
create policy "Members remove own votes" on public.poll_votes for delete to authenticated using (user_id = auth.uid());

create policy "Org members read ai suggestions" on public.ai_suggestions for select to authenticated using (public.is_org_member(organization_id));
create policy "Org members create ai suggestions" on public.ai_suggestions for insert to authenticated with check (requested_by = auth.uid() and public.is_org_member(organization_id));

create policy "Org managers read invitations" on public.invitations for select to authenticated using (public.is_org_manager(organization_id));
create policy "Org managers manage invitations" on public.invitations for all to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('activity-photos', 'activity-photos', false, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

create policy "Members can read activity photo objects" on storage.objects for select to authenticated using (
  bucket_id = 'activity-photos' and exists (
    select 1
    from public.activity_photos p
    join public.activities a on a.id = p.activity_id
    where p.storage_path = name and public.is_group_member(a.group_id)
  )
);

create policy "Members can upload activity photo objects" on storage.objects for insert to authenticated with check (
  bucket_id = 'activity-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Uploader can delete activity photo objects" on storage.objects for delete to authenticated using (
  bucket_id = 'activity-photos'
  and owner = auth.uid()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
