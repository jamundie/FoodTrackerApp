-- ============================================================
-- FoodTrackerApp — migration 002: macro tracking & nutrition goals
-- Run this in Supabase Dashboard → SQL Editor after 001_initial_schema.sql
-- ============================================================

-- ── food_entries: add macro totals ───────────────────────────
alter table public.food_entries
  add column if not exists total_protein  numeric(8,2),
  add column if not exists total_carbs    numeric(8,2),
  add column if not exists total_fat      numeric(8,2);

-- ── food_ingredients: add full macro profile per ingredient ──
alter table public.food_ingredients
  add column if not exists protein_per_100g  numeric(8,2),
  add column if not exists carbs_per_100g    numeric(8,2),
  add column if not exists fat_per_100g      numeric(8,2),
  add column if not exists fiber_per_100g    numeric(8,2),
  add column if not exists sugar_per_100g    numeric(8,2),
  add column if not exists salt_per_100g     numeric(8,2),
  add column if not exists nutrition_source  text;  -- 'manual' | 'open_food_facts' | 'gemini_vision'

-- ── user_profiles: add daily nutrition goals ─────────────────
alter table public.user_profiles
  add column if not exists daily_calorie_goal integer,
  add column if not exists daily_protein_goal numeric(6,1),
  add column if not exists daily_carb_goal    numeric(6,1),
  add column if not exists daily_fat_goal     numeric(6,1);
