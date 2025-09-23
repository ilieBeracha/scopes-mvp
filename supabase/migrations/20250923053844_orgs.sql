create type org_role as enum ('admin','member');

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.organization_members (
  org_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role org_role not null,
  joined_at timestamptz default now(),
  primary key (org_id, user_id),
  unique(user_id)  -- enforce exactly one org per user
);

-- Auto-create org + admin membership + update user metadata
create or replace function public.handle_profile_org()
returns trigger
language plpgsql
security definer
as $$
declare
  v_org uuid;
  v_org_name text;
begin
  -- Create organization
  v_org_name := 'Org of ' || new.email;
  insert into public.organizations (name, owner_id)
  values (v_org_name, new.id)
  returning id into v_org;

  -- Add user as admin member
  insert into public.organization_members (org_id, user_id, role)
  values (v_org, new.id, 'admin');

  -- Update user metadata with organization details
  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'organization', jsonb_build_object(
      'id', v_org,
      'name', v_org_name,
      'role', 'admin',
      'joined_at', now()
    )
  )
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists after_profile_insert on public.profiles;
create trigger after_profile_insert
after insert on public.profiles
for each row execute function public.handle_profile_org();

-- Function to update user metadata when organization membership changes
create or replace function public.update_user_org_metadata()
returns trigger
language plpgsql
security definer
as $$
declare
  v_org record;
begin
  -- Get organization details
  select * into v_org
  from public.organizations
  where id = new.org_id;

  -- Update user metadata in auth.users
  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'organization', jsonb_build_object(
      'id', v_org.id,
      'name', v_org.name,
      'role', new.role,
      'joined_at', new.joined_at
    )
  )
  where id = new.user_id;

  return new;
end;
$$;

-- Trigger to update user metadata when organization membership changes
drop trigger if exists on_org_member_change on public.organization_members;
create trigger on_org_member_change
after insert or update on public.organization_members
for each row execute function public.update_user_org_metadata();

-- RLS
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Helper function: list all org_ids a user belongs to
create or replace function public.user_org_ids(p_user uuid default auth.uid())
returns setof uuid
language sql
security definer
as $$
  select org_id from public.organization_members where user_id = p_user;
$$;

-- Then the policy can use this safely (no recursion)
create policy "members can view members"
on public.organization_members
for select
using (
  organization_members.org_id in (select * from public.user_org_ids())
);


-- Admins can update their org
create policy "admins can update org"
on public.organizations
for update
using (
  exists (
    select 1
    from public.organization_members om
    where om.org_id = organizations.id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.organization_members om
    where om.org_id = organizations.id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
);


-- Admins can insert/update/delete members of their org
create policy "admins manage members"
on public.organization_members
for all
using (
  exists (
    select 1
    from public.organization_members om
    where om.org_id = organization_members.org_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.organization_members om
    where om.org_id = organization_members.org_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
);
