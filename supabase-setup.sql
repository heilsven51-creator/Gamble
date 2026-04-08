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

alter table public.profiles
add column if not exists luck_boost integer not null default 1;

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
drop function if exists public.transfer_friend_coins(text, bigint);
drop function if exists public.remove_friendship(text);

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
  or (select auth.uid()) = friend_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = (select auth.uid())
      and admin_profile.is_admin = true
  )
);

create or replace function public.transfer_friend_coins(target_player_id text, transfer_amount bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_id uuid := auth.uid();
  sender_profile public.profiles%rowtype;
  target_profile public.profiles%rowtype;
  friendship_exists boolean;
begin
  if sender_id is null then
    raise exception 'Bitte zuerst einloggen.';
  end if;

  if transfer_amount is null or transfer_amount < 1 then
    raise exception 'Bitte sende mindestens 1 Coin.';
  end if;

  select *
  into sender_profile
  from public.profiles
  where id = sender_id;

  if not found then
    raise exception 'Dein Profil wurde nicht gefunden.';
  end if;

  select *
  into target_profile
  from public.profiles
  where player_id = upper(trim(target_player_id));

  if not found then
    raise exception 'Freund wurde nicht gefunden.';
  end if;

  if target_profile.id = sender_profile.id then
    raise exception 'Du kannst dir selbst keine Coins schicken.';
  end if;

  select exists (
    select 1
    from public.friends as first_side
    join public.friends as second_side
      on second_side.user_id = target_profile.id
     and second_side.friend_id = sender_profile.id
    where first_side.user_id = sender_profile.id
      and first_side.friend_id = target_profile.id
  )
  into friendship_exists;

  if not friendship_exists then
    raise exception 'Ihr seid nicht gegenseitig befreundet.';
  end if;

  if sender_profile.coins < transfer_amount then
    raise exception 'Du hast nicht genug Coins.';
  end if;

  update public.profiles
  set coins = coins - transfer_amount
  where id = sender_profile.id;

  update public.profiles
  set coins = coins + transfer_amount
  where id = target_profile.id;

  return jsonb_build_object(
    'ok', true,
    'message', transfer_amount || ' Coins an ' || target_profile.username || ' geschickt.'
  );
end;
$$;

grant execute on function public.transfer_friend_coins(text, bigint) to authenticated;

create or replace function public.remove_friendship(target_player_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_profile public.profiles%rowtype;
  target_profile public.profiles%rowtype;
  deleted_count bigint;
begin
  if current_user_id is null then
    raise exception 'Bitte zuerst einloggen.';
  end if;

  select *
  into current_profile
  from public.profiles
  where id = current_user_id;

  if not found then
    raise exception 'Dein Profil wurde nicht gefunden.';
  end if;

  select *
  into target_profile
  from public.profiles
  where player_id = upper(trim(target_player_id));

  if not found then
    raise exception 'Freund wurde nicht gefunden.';
  end if;

  if target_profile.id = current_profile.id then
    raise exception 'Du kannst dich nicht selbst entfernen.';
  end if;

  delete from public.friends
  where (user_id = current_profile.id and friend_id = target_profile.id)
     or (user_id = target_profile.id and friend_id = current_profile.id);

  get diagnostics deleted_count = row_count;

  if deleted_count = 0 then
    raise exception 'Zwischen euch besteht keine Freundschaft.';
  end if;

  return jsonb_build_object(
    'ok', true,
    'message', target_profile.username || ' wurde aus deiner Freundesliste entfernt.'
  );
end;
$$;

grant execute on function public.remove_friendship(text) to authenticated;
