-- Notifications table for user dashboard activities
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('reply', 'like', 'mention', 'system')),
  title text not null check (char_length(title) > 0 and char_length(title) <= 120),
  message text not null check (char_length(message) > 0 and char_length(message) <= 1200),
  actor_name text not null default 'System',
  actor_avatar_url text not null default '',
  target_url text,
  metadata jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notifications_user_read_created_idx
  on public.notifications (user_id, is_read, created_at desc);

create index if not exists notifications_user_type_created_idx
  on public.notifications (user_id, type, created_at desc);

alter table public.notifications enable row level security;

-- Read: users can only read their own notifications.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_user_read_own'
  ) then
    create policy "notifications_user_read_own"
    on public.notifications
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;
end
$$;

-- Insert: authenticated users can write notifications for themselves.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_user_insert_own'
  ) then
    create policy "notifications_user_insert_own"
    on public.notifications
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;
end
$$;

-- Update: users can mark their own notifications as read.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_user_update_own'
  ) then
    create policy "notifications_user_update_own"
    on public.notifications
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end
$$;

-- Delete: users can delete their own notifications.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_user_delete_own'
  ) then
    create policy "notifications_user_delete_own"
    on public.notifications
    for delete
    to authenticated
    using (auth.uid() = user_id);
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at
before update on public.notifications
for each row
execute function public.set_updated_at();
