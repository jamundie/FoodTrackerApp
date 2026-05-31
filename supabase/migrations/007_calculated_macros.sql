-- Migration 007: Add calculated macro columns to food_ingredients
--
-- 005_macros.sql added the per-100g reference columns (protein_per_100g, etc.)
-- but omitted the amount-scaled calculated columns that trackingService writes.
-- This migration adds them, consistent with calculated_calories (001) and
-- calculated_fiber (006).
--
-- Run once in Supabase Dashboard → SQL Editor.

alter table food_ingredients
  add column if not exists calculated_protein numeric,
  add column if not exists calculated_carbs   numeric,
  add column if not exists calculated_fat     numeric;
