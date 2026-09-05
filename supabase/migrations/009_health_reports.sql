-- Migration 009: health_reports table
--
-- Stores generated AI health correlation reports as immutable snapshots.
-- RLS pattern (select/insert/delete, no update) matches the bowel_entries
-- precedent (002_bowel_entries.sql) — reports are never edited after generation.
--
-- Applied automatically by .github/workflows/supabase-migrations.yml on merge to main.

create table if not exists public.health_reports (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  period_start   date not null,
  period_end     date not null,
  generated_at   timestamptz not null default now(),
  summary_stats  jsonb not null,
  correlations   jsonb not null,
  ai_report_text text not null,
  model          text not null
);

alter table public.health_reports enable row level security;

create policy "Users can view own health reports"
  on public.health_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own health reports"
  on public.health_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own health reports"
  on public.health_reports for delete
  using (auth.uid() = user_id);

create index if not exists idx_health_reports_user_period
  on public.health_reports(user_id, period_start desc);
