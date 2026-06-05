-- ============================================================
-- TrustHaul Freight - Supabase Schema
-- Run this entire file in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  account_type text check (account_type in ('driver', 'shipper')),
  onboarding_complete boolean default false,
  profile_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- DRIVER PROFILES
-- ============================================================
create table public.driver_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text,
  phone text,
  city text,
  state text,
  zip_code text,
  bio text,
  mc_number text,
  dot_number text,
  cdl_number text,
  cdl_state text,
  years_experience integer default 0,
  truck_types text[] default '{}',
  service_radius_miles integer default 500,
  insurance_url text,
  cdl_url text,
  profile_photo_url text,
  verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  average_rating numeric(3,2) default 0,
  total_reviews integer default 0,
  subscription_plan text default 'none',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SHIPPER PROFILES
-- ============================================================
create table public.shipper_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text,
  phone text,
  city text,
  state text,
  zip_code text,
  bio text,
  business_type text default 'small_business',
  ein_number text,
  address text,
  profile_photo_url text,
  verification_status text default 'pending',
  average_rating numeric(3,2) default 0,
  total_reviews integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- LOADS
-- ============================================================
create table public.loads (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  shipper_id uuid references public.shipper_profiles(id),
  shipper_user_id uuid references auth.users(id) not null,
  assigned_driver_id uuid references public.driver_profiles(id),
  assigned_driver_user_id uuid references auth.users(id),
  status text default 'posted' check (status in ('posted','assigned','in_transit','delivered','cancelled')),
  pickup_address text,
  pickup_city text,
  pickup_state text,
  pickup_zip text,
  pickup_date date,
  delivery_address text,
  delivery_city text,
  delivery_state text,
  delivery_zip text,
  delivery_date date,
  truck_type_required text default 'any',
  weight_lbs numeric,
  dimensions text,
  commodity text,
  special_instructions text,
  budget numeric,
  distance_miles numeric,
  is_urgent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- LOAD BIDS
-- ============================================================
create table public.load_bids (
  id uuid default uuid_generate_v4() primary key,
  load_id uuid references public.loads(id) on delete cascade not null,
  driver_id uuid references public.driver_profiles(id),
  driver_user_id uuid references auth.users(id) not null,
  bid_amount numeric not null,
  message text,
  status text default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id text not null,
  sender_id uuid references auth.users(id) not null,
  receiver_id uuid references auth.users(id) not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  load_id uuid references public.loads(id) on delete cascade not null,
  reviewer_id uuid references auth.users(id) not null,
  reviewee_id uuid references auth.users(id) not null,
  reviewer_type text check (reviewer_type in ('driver','shipper')),
  rating integer check (rating between 1 and 5),
  comment text,
  professionalism integer check (professionalism between 1 and 5),
  communication integer check (communication between 1 and 5),
  timeliness integer check (timeliness between 1 and 5),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - keeps data private
-- ============================================================

alter table public.profiles enable row level security;
alter table public.driver_profiles enable row level security;
alter table public.shipper_profiles enable row level security;
alter table public.loads enable row level security;
alter table public.load_bids enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- profiles: users can only read/write their own
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- driver_profiles: owner can do everything, others can read
create policy "driver_profiles_owner" on public.driver_profiles
  for all using (auth.uid() = user_id);
create policy "driver_profiles_read" on public.driver_profiles
  for select using (auth.uid() is not null);

-- shipper_profiles: owner can do everything, others can read
create policy "shipper_profiles_owner" on public.shipper_profiles
  for all using (auth.uid() = user_id);
create policy "shipper_profiles_read" on public.shipper_profiles
  for select using (auth.uid() is not null);

-- loads: shippers manage their own, drivers can read all posted
create policy "loads_shipper_manage" on public.loads
  for all using (auth.uid() = shipper_user_id);
create policy "loads_read_posted" on public.loads
  for select using (auth.uid() is not null);
create policy "loads_driver_update" on public.loads
  for update using (auth.uid() = assigned_driver_user_id);

-- load_bids: drivers manage their own bids, shippers read bids on their loads
create policy "bids_driver_manage" on public.load_bids
  for all using (auth.uid() = driver_user_id);
create policy "bids_shipper_read" on public.load_bids
  for select using (
    auth.uid() in (
      select shipper_user_id from public.loads where id = load_id
    )
  );
create policy "bids_shipper_update" on public.load_bids
  for update using (
    auth.uid() in (
      select shipper_user_id from public.loads where id = load_id
    )
  );

-- messages: only sender or receiver
create policy "messages_own" on public.messages
  for all using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- reviews: reviewer owns, reviewee can read
create policy "reviews_reviewer" on public.reviews
  for all using (auth.uid() = reviewer_id);
create policy "reviews_reviewee_read" on public.reviews
  for select using (auth.uid() = reviewee_id);
create policy "reviews_authenticated_read" on public.reviews
  for select using (auth.uid() is not null);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- STORAGE BUCKET for file uploads (CDL, insurance, photos)
-- ============================================================
-- Run this separately in: Storage > New Bucket
-- Bucket name: "documents"
-- Set to PRIVATE (not public)
-- Then add these policies in Storage > Policies:

-- INSERT policy: authenticated users can upload to their own folder
-- SELECT policy: authenticated users can view their own files
-- The bucket path convention: documents/{user_id}/{filename}
