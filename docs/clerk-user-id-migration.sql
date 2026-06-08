-- TrustHaul Freight - Clerk user ID migration
-- Run in Supabase Dashboard > SQL Editor after switching auth from Supabase Auth to Clerk.
--
-- Clerk user IDs look like "user_..." and are text, not UUIDs.
-- This migration removes auth.users foreign keys and converts app-owned user ID
-- columns from uuid to text.

begin;

-- Drop old RLS policies that compare auth.uid() UUIDs against user columns.
drop policy if exists "profiles_own" on public.profiles;
drop policy if exists "driver_profiles_owner" on public.driver_profiles;
drop policy if exists "driver_profiles_read" on public.driver_profiles;
drop policy if exists "shipper_profiles_owner" on public.shipper_profiles;
drop policy if exists "shipper_profiles_read" on public.shipper_profiles;
drop policy if exists "loads_shipper_manage" on public.loads;
drop policy if exists "loads_read_posted" on public.loads;
drop policy if exists "loads_driver_update" on public.loads;
drop policy if exists "bids_driver_manage" on public.load_bids;
drop policy if exists "bids_shipper_read" on public.load_bids;
drop policy if exists "bids_shipper_update" on public.load_bids;
drop policy if exists "messages_own" on public.messages;
drop policy if exists "reviews_reviewer" on public.reviews;
drop policy if exists "reviews_reviewee_read" on public.reviews;
drop policy if exists "reviews_authenticated_read" on public.reviews;

-- Drop foreign keys to Supabase Auth users.
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.driver_profiles drop constraint if exists driver_profiles_user_id_fkey;
alter table public.shipper_profiles drop constraint if exists shipper_profiles_user_id_fkey;
alter table public.loads drop constraint if exists loads_shipper_user_id_fkey;
alter table public.loads drop constraint if exists loads_assigned_driver_user_id_fkey;
alter table public.load_bids drop constraint if exists load_bids_driver_user_id_fkey;
alter table public.messages drop constraint if exists messages_sender_id_fkey;
alter table public.messages drop constraint if exists messages_receiver_id_fkey;
alter table public.reviews drop constraint if exists reviews_reviewer_id_fkey;
alter table public.reviews drop constraint if exists reviews_reviewee_id_fkey;

-- Convert user ID columns to text so they can store Clerk IDs.
alter table public.profiles
  alter column id type text using id::text;

alter table public.driver_profiles
  alter column user_id type text using user_id::text;

alter table public.shipper_profiles
  alter column user_id type text using user_id::text;

alter table public.loads
  alter column shipper_user_id type text using shipper_user_id::text,
  alter column assigned_driver_user_id type text using assigned_driver_user_id::text;

alter table public.load_bids
  alter column driver_user_id type text using driver_user_id::text;

alter table public.messages
  alter column sender_id type text using sender_id::text,
  alter column receiver_id type text using receiver_id::text;

alter table public.reviews
  alter column reviewer_id type text using reviewer_id::text,
  alter column reviewee_id type text using reviewee_id::text;

-- Supabase Auth no longer creates users, so disable the old auth trigger.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Temporary app access policies for Clerk migration.
-- These unblock the current frontend while you finish moving database access behind
-- Clerk-aware server functions/RLS. Tighten before broad production launch.
create policy "profiles_app_access" on public.profiles for all using (true) with check (true);
create policy "driver_profiles_app_access" on public.driver_profiles for all using (true) with check (true);
create policy "shipper_profiles_app_access" on public.shipper_profiles for all using (true) with check (true);
create policy "loads_app_access" on public.loads for all using (true) with check (true);
create policy "load_bids_app_access" on public.load_bids for all using (true) with check (true);
create policy "messages_app_access" on public.messages for all using (true) with check (true);
create policy "reviews_app_access" on public.reviews for all using (true) with check (true);

commit;
