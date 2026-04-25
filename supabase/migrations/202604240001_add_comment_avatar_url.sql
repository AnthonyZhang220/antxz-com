alter table public.comments
add column if not exists avatar_url text not null default '';

update public.comments as comments
set avatar_url = coalesce(
  nullif(users.raw_user_meta_data->>'avatar_url', ''),
  nullif(users.raw_user_meta_data->>'picture', ''),
  comments.avatar_url
)
from auth.users as users
where comments.user_id = users.id
  and comments.avatar_url = '';