alter table public.activity
  add column if not exists start_time time null,
  add column if not exists end_time time null;

create index if not exists idx_activity_user_id
  on public.activity (user_id);

create index if not exists idx_activity_date
  on public.activity (date desc);
