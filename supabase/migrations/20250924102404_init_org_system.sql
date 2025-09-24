begin;

-- ===========================
-- PROFILES
-- ===========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique not null,
  created_at timestamptz default now()
);

-- Trigger: create profile when auth.users row is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer as $$
begin
  insert into public.profiles (id, email, first_name, last_name, created_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.created_at
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Trigger: delete auth.users row when profile is deleted
create or replace function public.handle_user_deleted()
returns trigger
language plpgsql
security definer as $$
begin
  delete from auth.users where id = old.id;
  return old;
end;
$$;

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
after delete on auth.users
for each row execute function public.handle_user_deleted();

-- RLS
alter table public.profiles enable row level security;

drop policy if exists "users can view self" on public.profiles;
create policy "users can view self"
on public.profiles
for select
using (id = auth.uid());

drop policy if exists "users can update self" on public.profiles;
create policy "users can update self"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- ===========================
-- ORGANIZATIONS
-- ===========================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'org_role') then
    create type org_role as enum ('admin','member');
  end if;
end$$;

drop table if exists public.organizations cascade;
create table public.organizations (
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
  unique(user_id) -- enforce exactly one org per user
);

-- Update auth.users metadata on membership change
create or replace function public.update_user_org_metadata()
returns trigger
language plpgsql
security definer as $$
declare
  v_org record;
begin
  select * into v_org from public.organizations where id = new.org_id;

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

drop trigger if exists on_org_member_change on public.organization_members;
create trigger on_org_member_change
after insert or update on public.organization_members
for each row execute function public.update_user_org_metadata();

-- RLS
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Helper: return all org_ids for a user
create or replace function public.user_org_ids(p_user uuid default auth.uid())
returns setof uuid
language sql
security definer as $$
  select org_id from public.organization_members where user_id = p_user;
$$;

-- Policies
drop policy if exists "users can create organizations" on public.organizations;
create policy "users can create organizations"
on public.organizations
for insert
with check (
  owner_id = auth.uid()
  and not exists (
    select 1 from public.organization_members where user_id = auth.uid()
  )
);

drop policy if exists "members can view their org" on public.organizations;
create policy "members can view their org"
on public.organizations
for select
using (
  exists (
    select 1 from public.organization_members om
    where om.org_id = organizations.id
      and om.user_id = auth.uid()
  )
);

drop policy if exists "admins can update org" on public.organizations;
create policy "admins can update org"
on public.organizations
for update
using (
  exists (
    select 1 from public.organization_members om
    where om.org_id = organizations.id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.organization_members om
    where om.org_id = organizations.id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
);

drop policy if exists "members can view members" on public.organization_members;
create policy "members can view members"
on public.organization_members
for select
using (
  organization_members.org_id in (select * from public.user_org_ids())
);

drop policy if exists "admins manage members" on public.organization_members;
create policy "admins manage members"
on public.organization_members
for all
using (
  exists (
    select 1 from public.organization_members om
    where om.org_id = organization_members.org_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.organization_members om
    where om.org_id = organization_members.org_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
);

-- ===========================
-- INVITATIONS
-- ===========================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'invitation_status') then
    create type invitation_status as enum ('pending','accepted','expired');
  end if;
end$$;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  org_id uuid references public.organizations(id) on delete cascade,
  role org_role not null,
  token text unique not null,
  status invitation_status default 'pending',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

alter table public.invitations enable row level security;

drop policy if exists "members view org invites or their own email" on public.invitations;
create policy "members view org invites or their own email"
on public.invitations
for select
using (
  exists (
    select 1 from public.organization_members om
    where om.org_id = invitations.org_id
      and om.user_id = auth.uid()
  )
  or lower(invitations.email) = (
    select lower(p.email) from public.profiles p where p.id = auth.uid()
  )
);

drop policy if exists "admins create invites" on public.invitations;
create policy "admins create invites"
on public.invitations
for insert
with check (
  exists (
    select 1 from public.organization_members om
    where om.org_id = invitations.org_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
);

drop policy if exists "admins update invites" on public.invitations;
create policy "admins update invites"
on public.invitations
for update
using (
  exists (
    select 1 from public.organization_members om
    where om.org_id = invitations.org_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.organization_members om
    where om.org_id = invitations.org_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
);

-- ===========================
-- FUNCTIONS
-- ===========================

-- Invite user
create or replace function public.invite_user(
  p_email text,
  p_org uuid,
  p_role org_role
) returns invitations
language plpgsql
security definer as $$
declare
  v_token text := encode(gen_random_bytes(16), 'hex');
  v_inv invitations;
begin
  insert into invitations(email, org_id, role, token, created_by)
  values (p_email, p_org, p_role, v_token, auth.uid())
  returning * into v_inv;
  return v_inv;
end;
$$;

-- Accept invite
create or replace function public.accept_invite(
  p_token text
) returns organization_members
language plpgsql
security definer as $$
declare
  v_inv invitations;
  v_mem organization_members;
begin
  select * into v_inv
  from invitations
  where token = p_token
    and status = 'pending'
    and now() < expires_at;

  if not found then
    raise exception 'Invalid or expired invite';
  end if;

  insert into organization_members(org_id, user_id, role)
  values (v_inv.org_id, auth.uid(), v_inv.role)
  on conflict (user_id) do update
    set role = excluded.role, org_id = excluded.org_id
  returning * into v_mem;

  update invitations set status = 'accepted' where id = v_inv.id;

  return v_mem;
end;
$$;

-- Manual org creation
create or replace function public.create_organization(
  p_name text,
  p_user_id uuid default auth.uid()
) returns organizations
language plpgsql
security definer as $$
declare
  v_org organizations;
  v_user_exists boolean;
  v_auth_user record;
begin
  if exists (select 1 from public.organization_members where user_id = p_user_id) then
    raise exception 'User already belongs to an organization';
  end if;

  select exists(select 1 from public.profiles where id = p_user_id) into v_user_exists;
  if not v_user_exists then
    select * into v_auth_user from auth.users where id = p_user_id;
    if v_auth_user is null then
      raise exception 'User not found in auth.users';
    end if;
    insert into public.profiles (id, email, first_name, last_name, created_at)
    values (
      v_auth_user.id,
      v_auth_user.email,
      v_auth_user.raw_user_meta_data->>'first_name',
      v_auth_user.raw_user_meta_data->>'last_name',
      v_auth_user.created_at
    );
  end if;

  insert into public.organizations (name, owner_id)
  values (p_name, p_user_id)
  returning * into v_org;

  insert into public.organization_members (org_id, user_id, role)
  values (v_org.id, p_user_id, 'admin');

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'organization', jsonb_build_object(
      'id', v_org.id,
      'name', v_org.name,
      'role', 'admin',
      'joined_at', now()
    )
  )
  where id = p_user_id;

  return v_org;
end;
$$;

-- Check if user has org
create or replace function public.user_has_organization(
  p_user_id uuid default auth.uid()
) returns boolean
language sql
security definer as $$
  select exists (
    select 1 from public.organization_members where user_id = p_user_id
  );
$$;

-- Get user's org
create or replace function public.get_user_organization(
  p_user_id uuid default auth.uid()
) returns organizations
language sql
security definer as $$
  select o.*
  from public.organizations o
  join public.organization_members om on om.org_id = o.id
  where om.user_id = p_user_id
  limit 1;
$$;

commit;
