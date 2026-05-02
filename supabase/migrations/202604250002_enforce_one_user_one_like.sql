-- Enforce one-user-one-like per comment.
-- Safe to run repeatedly.

-- 1) Clean up existing duplicates first (if any), keep earliest like.
with ranked as (
  select
    ctid,
    row_number() over (
      partition by comment_id, user_id
      order by created_at asc, ctid asc
    ) as rn
  from public.comment_likes
)
delete from public.comment_likes cl
using ranked r
where cl.ctid = r.ctid
  and r.rn > 1;

-- 2) Ensure database-level uniqueness for (comment_id, user_id).
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.comment_likes'::regclass
      and contype in ('p', 'u')
      and conkey = array[
        (select attnum from pg_attribute where attrelid = 'public.comment_likes'::regclass and attname = 'comment_id' and not attisdropped),
        (select attnum from pg_attribute where attrelid = 'public.comment_likes'::regclass and attname = 'user_id' and not attisdropped)
      ]::smallint[]
  ) then
    alter table public.comment_likes
      add constraint comment_likes_comment_user_unique unique (comment_id, user_id);
  end if;
end
$$;
