-- Bari Parinay Sutra database + Row Level Security
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  gender text not null check (gender in ('male','female')),
  dob date not null,
  education text,
  occupation text,
  state text not null,
  district text not null,
  tehsil text not null,
  email text,
  phone text,
  photo_url text,
  about text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admins where user_id=auth.uid()); $$;

-- Public visitors can only see approved profiles and NEVER the phone/email columns.
-- Because normal table SELECT would expose all columns, create a safe view.
create or replace view public.public_profiles
with (security_invoker=true) as
select id, full_name, gender, dob, education, occupation, state, district, tehsil, photo_url, about, created_at
from public.profiles where status='approved';

grant select on public.public_profiles to anon, authenticated;

create policy "users insert own profile"
on public.profiles for insert to authenticated
with check (user_id=auth.uid());

create policy "users read own profile"
on public.profiles for select to authenticated
using (user_id=auth.uid() or public.is_admin());

create policy "admin update profiles"
on public.profiles for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admin delete profiles"
on public.profiles for delete to authenticated
using (public.is_admin());

create policy "admin read admins"
on public.admins for select to authenticated
using (public.is_admin());

-- IMPORTANT: Do NOT expose service_role key in frontend.
-- After creating your first Auth user in Supabase Dashboard, add that user's UUID:
-- insert into public.admins(user_id) values ('YOUR-AUTH-USER-UUID');
