-- A/B Test Events Table
-- Tracks pricing variant views and CTA clicks for the live A/B test

create table if not exists public.ab_events (
  id          bigserial primary key,
  variant     char(1)     not null check (variant in ('A', 'B', 'C')),
  event       text        not null,  -- 'pricing_viewed' | 'cta_clicked'
  session_id  text        not null,
  meta        jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

-- Index for fast aggregation queries
create index if not exists ab_events_variant_event_idx on public.ab_events (variant, event);
create index if not exists ab_events_created_at_idx   on public.ab_events (created_at);

-- Row Level Security: only insert allowed (no reads from client)
alter table public.ab_events enable row level security;

create policy "Allow insert for anon" on public.ab_events
  for insert to anon with check (true);

-- Convenience view: conversion rates per variant
create or replace view public.ab_results as
select
  variant,
  count(*) filter (where event = 'pricing_viewed') as views,
  count(*) filter (where event = 'cta_clicked')   as clicks,
  round(
    count(*) filter (where event = 'cta_clicked')::numeric
    / nullif(count(*) filter (where event = 'pricing_viewed'), 0) * 100,
    1
  ) as conversion_pct
from public.ab_events
group by variant
order by variant;
