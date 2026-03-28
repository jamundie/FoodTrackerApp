-- ============================================================
-- FoodTrackerApp — initial schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── user_profiles ────────────────────────────────────────────
create table if not exists public.user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text not null default '',
  age             integer,
  weight_kg       numeric(5,2),
  height_cm       numeric(5,1),
  daily_water_goal_ml integer,
  default_volume_preset_id text not null default 'glass',
  updated_at      timestamptz not null default now()
);

-- auto-create a profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── food_entries ─────────────────────────────────────────────
create table if not exists public.food_entries (
  id              text primary key,           -- app-generated (generateId())
  user_id         uuid not null references auth.users(id) on delete cascade,
  meal_name       text not null,
  category        text not null,
  timestamp       timestamptz not null,
  total_calories  numeric(8,2),
  photo_storage_path text,                    -- path inside meal-photos bucket; null when no photo
  created_at      timestamptz not null default now()
);

-- ── food_ingredients ─────────────────────────────────────────
create table if not exists public.food_ingredients (
  id                  text primary key,
  food_entry_id       text not null references public.food_entries(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  amount              numeric(10,3) not null,
  unit                text not null,          -- 'g' | 'ml' | 'piece'
  calories_per_100g   numeric(8,2),
  calculated_calories numeric(8,2)
);

-- ── water_entries ────────────────────────────────────────────
create table if not exists public.water_entries (
  id                    text primary key,
  user_id               uuid not null references auth.users(id) on delete cascade,
  entry_name            text not null,
  timestamp             timestamptz not null,
  volume_preset_id      text not null,
  volume_ml             numeric(8,2) not null,
  total_volume          numeric(8,2),
  created_at            timestamptz not null default now()
);

-- ── water_ingredients ────────────────────────────────────────
create table if not exists public.water_ingredients (
  id                  text primary key,
  water_entry_id      text not null references public.water_entries(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  amount              numeric(10,3) not null,
  unit                text not null,
  calories_per_100g   numeric(8,2),
  calculated_calories numeric(8,2)
);

-- ── Row Level Security ────────────────────────────────────────
alter table public.user_profiles    enable row level security;
alter table public.food_entries     enable row level security;
alter table public.food_ingredients enable row level security;
alter table public.water_entries    enable row level security;
alter table public.water_ingredients enable row level security;

-- user_profiles: each user sees and edits only their own row
create policy "users select own profile"
  on public.user_profiles for select using (auth.uid() = id);
create policy "users update own profile"
  on public.user_profiles for update using (auth.uid() = id);

-- food_entries
create policy "users select own food entries"
  on public.food_entries for select using (auth.uid() = user_id);
create policy "users insert own food entries"
  on public.food_entries for insert with check (auth.uid() = user_id);
create policy "users delete own food entries"
  on public.food_entries for delete using (auth.uid() = user_id);

-- food_ingredients
create policy "users select own food ingredients"
  on public.food_ingredients for select using (auth.uid() = user_id);
create policy "users insert own food ingredients"
  on public.food_ingredients for insert with check (auth.uid() = user_id);
create policy "users delete own food ingredients"
  on public.food_ingredients for delete using (auth.uid() = user_id);

-- water_entries
create policy "users select own water entries"
  on public.water_entries for select using (auth.uid() = user_id);
create policy "users insert own water entries"
  on public.water_entries for insert with check (auth.uid() = user_id);
create policy "users delete own water entries"
  on public.water_entries for delete using (auth.uid() = user_id);

-- water_ingredients
create policy "users select own water ingredients"
  on public.water_ingredients for select using (auth.uid() = user_id);
create policy "users insert own water ingredients"
  on public.water_ingredients for insert with check (auth.uid() = user_id);
create policy "users delete own water ingredients"
  on public.water_ingredients for delete using (auth.uid() = user_id);

-- ── Storage: meal-photos (private bucket) ────────────────────
-- Run this after the tables above.
-- Each user's photos live at: meal-photos/{user_id}/{entry_id}.jpg
-- Access is only possible via signed URLs generated server-side per request.

insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', false)
on conflict (id) do nothing;

-- Users can upload/read/delete only within their own folder
create policy "users upload own photos"
  on storage.objects for insert
  with check (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users read own photos"
  on storage.objects for select
  using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users delete own photos"
  on storage.objects for delete
  using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
