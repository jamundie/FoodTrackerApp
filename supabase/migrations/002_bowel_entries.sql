-- ============================================================
-- FoodTrackerApp — bowel movement tracking
-- Run this in Supabase Dashboard → SQL Editor after 001_initial_schema.sql
-- ============================================================

-- ── bowel_entries ─────────────────────────────────────────────
create table if not exists public.bowel_entries (
  id          text primary key,                              -- app-generated (generateId())
  user_id     uuid not null references auth.users(id) on delete cascade,
  timestamp   timestamptz not null,
  bristol_type integer not null check (bristol_type between 1 and 7),
  urgency     text not null default 'none'
                check (urgency in ('none', 'mild', 'moderate', 'urgent')),
  has_blood   boolean not null default false,
  pain_level  integer not null default 0 check (pain_level between 0 and 10),
  notes       text,
  created_at  timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────
alter table public.bowel_entries enable row level security;

create policy "users select own bowel entries"
  on public.bowel_entries for select using (auth.uid() = user_id);

create policy "users insert own bowel entries"
  on public.bowel_entries for insert with check (auth.uid() = user_id);

create policy "users delete own bowel entries"
  on public.bowel_entries for delete using (auth.uid() = user_id);
