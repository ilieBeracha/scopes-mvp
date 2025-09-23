-- Manual organization creation functions

-- Function for manual organization creation
create or replace function public.create_organization(
  p_name text,
  p_user_id uuid default auth.uid()
) returns organizations
language plpgsql
security definer
as $$
declare
  v_org organizations;
  v_user_exists boolean;
  v_auth_user record;
begin
  -- Check if user already has an organization
  if exists (
    select 1 from public.organization_members 
    where user_id = p_user_id
  ) then
    raise exception 'User already belongs to an organization';
  end if;

  -- Check if profile exists, if not create it
  select exists(select 1 from public.profiles where id = p_user_id) into v_user_exists;
  
  if not v_user_exists then
    -- Get user data from auth.users to create profile
    select * into v_auth_user from auth.users where id = p_user_id;
    
    if v_auth_user is null then
      raise exception 'User not found in auth.users';
    end if;
    
    -- Create the profile record
    insert into public.profiles (id, email, first_name, last_name, created_at)
    values (
      v_auth_user.id, 
      v_auth_user.email, 
      v_auth_user.raw_user_meta_data->>'first_name', 
      v_auth_user.raw_user_meta_data->>'last_name', 
      v_auth_user.created_at
    );
  end if;

  -- Create organization
  insert into public.organizations (name, owner_id)
  values (p_name, p_user_id)
  returning * into v_org;

  -- Add user as admin member
  insert into public.organization_members (org_id, user_id, role)
  values (v_org.id, p_user_id, 'admin');

  -- Update user metadata with organization details
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

-- Function to check if user has organization
create or replace function public.user_has_organization(
  p_user_id uuid default auth.uid()
) returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.organization_members 
    where user_id = p_user_id
  );
$$;

-- Function to get user's organization
create or replace function public.get_user_organization(
  p_user_id uuid default auth.uid()
) returns organizations
language sql
security definer
as $$
  select o.*
  from public.organizations o
  join public.organization_members om on om.org_id = o.id
  where om.user_id = p_user_id
  limit 1;
$$;

-- Add policy for organization creation
create policy "users can create organizations"
on public.organizations
for insert
with check (
  owner_id = auth.uid() and
  not exists (
    select 1 from public.organization_members 
    where user_id = auth.uid()
  )
);

-- Add policy for members to view their org
create policy "members can view their org"
on public.organizations
for select
using (
  exists (
    select 1
    from public.organization_members om
    where om.org_id = organizations.id
      and om.user_id = auth.uid()
  )
);
