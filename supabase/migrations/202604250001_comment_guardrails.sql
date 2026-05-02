alter table public.comments
drop constraint if exists comments_status_check;

update public.comments
set status = case
  when status = 'pending' then 'quarantine'
  when status = 'hidden' then 'blocked'
  else status
end
where status in ('pending', 'hidden');

alter table public.comments
add constraint comments_status_check
check (status in ('published', 'quarantine', 'spam', 'blocked'));

create table if not exists public.comment_blocked_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  blocked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.comment_blocked_users enable row level security;

drop policy if exists "comments_public_read_published" on public.comments;
create policy "comments_public_read_published"
on public.comments
for select
using (
  status = 'published'
  or (status = 'quarantine' and auth.uid() = user_id)
);

drop policy if exists "comment_blocked_users_self_read" on public.comment_blocked_users;
create policy "comment_blocked_users_self_read"
on public.comment_blocked_users
for select
to authenticated
using (auth.uid() = user_id);
