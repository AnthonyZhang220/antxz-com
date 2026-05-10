-- Article bookmarks for blog posts.
-- article_key format: blog:{slug}

create table if not exists public.article_bookmarks (
  article_key text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_key, user_id)
);

create index if not exists article_bookmarks_user_id_created_at_idx
  on public.article_bookmarks (user_id, created_at desc);

alter table public.article_bookmarks enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'article_bookmarks'
      and policyname = 'article_bookmarks_user_read_own'
  ) then
    create policy "article_bookmarks_user_read_own"
    on public.article_bookmarks
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'article_bookmarks'
      and policyname = 'article_bookmarks_user_insert_own'
  ) then
    create policy "article_bookmarks_user_insert_own"
    on public.article_bookmarks
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
      and tablename = 'article_bookmarks'
      and policyname = 'article_bookmarks_user_delete_own'
  ) then
    create policy "article_bookmarks_user_delete_own"
    on public.article_bookmarks
    for delete
    to authenticated
    using (auth.uid() = user_id);
  end if;
end
$$;