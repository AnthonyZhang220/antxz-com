-- User Settings table for dashboard
-- Stores user preferences like language, region, theme, etc.

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'zh')),
  region text not null default 'global' check (region in ('cn', 'us', 'global')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- Policy: Users can view their own settings
create policy if not exists "user_settings_public_view_own"
on public.user_settings
for select
to authenticated
using (auth.uid() = user_id);

-- Policy: Users can update their own settings
create policy if not exists "user_settings_user_update_own"
on public.user_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: Users can insert their own settings
create policy if not exists "user_settings_user_insert_own"
on public.user_settings
for insert
to authenticated
with check (auth.uid() = user_id);

-- Auto-update the updated_at timestamp
create or replace function public.update_user_settings_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_settings_update_timestamp on public.user_settings;
create trigger user_settings_update_timestamp
before update on public.user_settings
for each row
execute function public.update_user_settings_timestamp();
