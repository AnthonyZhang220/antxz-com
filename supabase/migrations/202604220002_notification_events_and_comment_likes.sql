-- Notification event plumbing for comments and likes

create table if not exists public.article_notification_targets (
  article_key text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create index if not exists comment_likes_comment_id_created_at_idx
  on public.comment_likes (comment_id, created_at desc);

alter table public.article_notification_targets enable row level security;
alter table public.comment_likes enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'article_notification_targets'
      and policyname = 'article_notification_targets_public_read'
  ) then
    create policy "article_notification_targets_public_read"
    on public.article_notification_targets
    for select
    using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'comment_likes'
      and policyname = 'comment_likes_public_read'
  ) then
    create policy "comment_likes_public_read"
    on public.comment_likes
    for select
    using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'comment_likes'
      and policyname = 'comment_likes_user_insert_own'
  ) then
    create policy "comment_likes_user_insert_own"
    on public.comment_likes
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'comment_likes'
      and policyname = 'comment_likes_user_delete_own'
  ) then
    create policy "comment_likes_user_delete_own"
    on public.comment_likes
    for delete
    to authenticated
    using (auth.uid() = user_id);
  end if;
end
$$;

create or replace function public.create_notification(
  p_user_id uuid,
  p_actor_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_actor_name text default 'System',
  p_actor_avatar_url text default '',
  p_target_url text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification_id uuid;
begin
  if p_user_id is null then
    return null;
  end if;

  if p_actor_user_id is not null and p_actor_user_id = p_user_id then
    return null;
  end if;

  insert into public.notifications (
    user_id,
    actor_user_id,
    type,
    title,
    message,
    actor_name,
    actor_avatar_url,
    target_url,
    metadata
  ) values (
    p_user_id,
    p_actor_user_id,
    p_type,
    left(coalesce(p_title, ''), 120),
    left(coalesce(p_message, ''), 1200),
    left(coalesce(nullif(p_actor_name, ''), 'System'), 120),
    coalesce(p_actor_avatar_url, ''),
    p_target_url,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_notification_id;

  return v_notification_id;
end;
$$;

grant execute on function public.create_notification(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) to authenticated;

drop trigger if exists article_notification_targets_set_updated_at on public.article_notification_targets;
create trigger article_notification_targets_set_updated_at
before update on public.article_notification_targets
for each row
execute function public.set_updated_at();