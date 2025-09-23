create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create type org_role as enum ('admin', 'member');

create table if not exists public.organization_members (
  org_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role org_role not null,
  joined_at timestamptz default now(),
  primary key (org_id, user_id)
);
