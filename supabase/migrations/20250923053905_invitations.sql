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

alter table public.invitations enable row level security;
-- Members can view org invitations OR invitations sent to their email
create policy "members view org invites or their own email"
on public.invitations
for select
using (
  exists (
    select 1
    from public.organization_members om
    where om.org_id = invitations.org_id
      and om.user_id = auth.uid()
  )
  or lower(invitations.email) = (
    select lower(p.email) from public.profiles p where p.id = auth.uid()
  )
);

-- Admins can create invitations for their org
create policy "admins create invites"
on public.invitations
for insert
with check (
  exists (
    select 1
    from public.organization_members om
    where om.org_id = invitations.org_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
);

-- Admins can update invitations for their org
create policy "admins update invites"
on public.invitations
for update
using (
  exists (
    select 1
    from public.organization_members om
    where om.org_id = invitations.org_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.organization_members om
    where om.org_id = invitations.org_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
);
