-- Article likes for blog posts.
-- article_key format: blog:{slug}

create table if not exists public.article_likes (
  article_key text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_key, user_id)
);

create index if not exists article_likes_article_key_created_at_idx
  on public.article_likes (article_key, created_at desc);

alter table public.article_likes enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'article_likes'
      and policyname = 'article_likes_public_read'
  ) then
    create policy "article_likes_public_read"
    on public.article_likes
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
      and tablename = 'article_likes'
      and policyname = 'article_likes_user_insert_own'
  ) then
    create policy "article_likes_user_insert_own"
    on public.article_likes
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
      and tablename = 'article_likes'
      and policyname = 'article_likes_user_delete_own'
  ) then
    create policy "article_likes_user_delete_own"
    on public.article_likes
    for delete
    to authenticated
    using (auth.uid() = user_id);
  end if;
end
$$;
