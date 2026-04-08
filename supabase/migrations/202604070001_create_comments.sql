-- Comments table for blog posts (Supabase)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_key text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  content text not null check (char_length(content) > 0 and char_length(content) <= 4000),
  status text not null default 'published' check (status in ('published', 'pending', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_article_key_created_at_idx
  on public.comments (article_key, created_at desc);

alter table public.comments enable row level security;

-- Read: everyone can read published comments
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'comments'
      and policyname = 'comments_public_read_published'
  ) then
    create policy "comments_public_read_published"
    on public.comments
    for select
    using (status = 'published');
  end if;
end
$$;

-- Insert: authenticated users can post comments as themselves
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'comments'
      and policyname = 'comments_user_insert_own'
  ) then
    create policy "comments_user_insert_own"
    on public.comments
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;
end
$$;

-- Update: users can update only their own comments
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'comments'
      and policyname = 'comments_user_update_own'
  ) then
    create policy "comments_user_update_own"
    on public.comments
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end
$$;

-- Delete: users can delete only their own comments
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'comments'
      and policyname = 'comments_user_delete_own'
  ) then
    create policy "comments_user_delete_own"
    on public.comments
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

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
before update on public.comments
for each row
execute function public.set_updated_at();
