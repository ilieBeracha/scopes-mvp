create type invitation_status as enum ('pending','accepted','expired');

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
