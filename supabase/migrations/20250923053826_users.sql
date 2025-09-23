create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique not null,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, created_at)
  values (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.created_at);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- A user can only see their own profile
create policy "users can view self"
on public.profiles
for select
using (id = auth.uid());

-- A user can only update their own profile
create policy "users can update self"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- If user is Deleted then delete also the auth.users trigger
create or replace function public.handle_user_deleted()
returns trigger
language plpgsql
security definer
as $$
begin
  delete from auth.users where id = old.id;
  return old;
end;
$$;
drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
after delete on auth.users
for each row execute function public.handle_user_deleted();