-- Invite user
create or replace function public.invite_user(
  p_email text,
  p_org uuid,
  p_role org_role
) returns invitations
language plpgsql
security definer
as $$
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
security definer
as $$
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
  on conflict (user_id) do update set role = excluded.role, org_id = excluded.org_id
  returning * into v_mem;

  update invitations set status = 'accepted' where id = v_inv.id;

  return v_mem;
end;
$$;
