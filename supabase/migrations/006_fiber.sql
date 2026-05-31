-- Migration 006: Add calculated_fiber to food_ingredients and total_fiber to food_entries
--
-- fiber_per_100g already existed from 001_initial_schema.sql.
-- This migration adds the *calculated* (amount-scaled) fiber column on ingredients
-- and the *total* fiber column on entries, consistent with how protein/carbs/fat
-- are stored.
--
-- Run once in Supabase Dashboard → SQL Editor.

alter table food_ingredients
  add column if not exists calculated_fiber numeric;

alter table food_entries
  add column if not exists total_fiber numeric;
