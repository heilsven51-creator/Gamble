-- Gamble Royale: Supabase setup
-- Run this in the Supabase SQL editor after creating your project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  player_id text not null unique,
  coins bigint not null default 1000,
  is_admin boolean not null default false,
  daily_last_claim date,
  work_date date,
  work_completed integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, friend_id)
);

alter table public.profiles enable row level security;
alter table public.friends enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_delete_own_or_admin" on public.profiles;
drop policy if exists "friends_select_own" on public.friends;
drop policy if exists "friends_insert_own" on public.friends;
drop policy if exists "friends_delete_own" on public.friends;
drop policy if exists "friends_delete_own_or_admin" on public.friends;

create policy "profiles_select_all"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = (select auth.uid())
      and admin_profile.is_admin = true
  )
)
with check (
  (select auth.uid()) = id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = (select auth.uid())
      and admin_profile.is_admin = true
  )
);

create policy "profiles_delete_own_or_admin"
on public.profiles
for delete
to authenticated
using (
  (select auth.uid()) = id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = (select auth.uid())
      and admin_profile.is_admin = true
  )
);

create policy "friends_select_own"
on public.friends
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or (select auth.uid()) = friend_id
);

create policy "friends_insert_own"
on public.friends
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = (select auth.uid())
      and admin_profile.is_admin = true
  )
);

create policy "friends_delete_own_or_admin"
on public.friends
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = (select auth.uid())
      and admin_profile.is_admin = true
  )
);
