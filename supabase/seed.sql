-- Seed data for local development.
-- Inserts notification targets, sample comments, likes and notifications when auth users exist.

do $$
declare
  v_owner_id uuid;
  v_actor_id uuid;
  v_actor_name text;
  v_comment_id uuid;
begin
  select id into v_owner_id
  from auth.users
  order by created_at asc
  limit 1;

  if v_owner_id is null then
    raise notice 'Skipping seed.sql because auth.users is empty.';
    return;
  end if;

  select id,
         coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1), 'Reader')
  into v_actor_id, v_actor_name
  from auth.users
  where id <> v_owner_id
  order by created_at asc
  limit 1;

  insert into public.article_notification_targets (article_key, user_id)
  values
    ('blog:building-personal-platform-nextjs', v_owner_id),
    ('blog:bilingual-content-strategy-sanity', v_owner_id),
    ('blog:tailwind-shadcn-design-system', v_owner_id)
  on conflict (article_key) do update
    set user_id = excluded.user_id,
        updated_at = now();

  insert into public.comments (article_key, user_id, author_name, content, status, created_at)
  values (
    'blog:building-personal-platform-nextjs',
    v_owner_id,
    'Anthony',
    'This is a seeded comment so the notifications and likes UI have something to render.',
    'published',
    now() - interval '2 hours'
  )
  returning id into v_comment_id;

  if v_actor_id is not null then
    insert into public.comments (article_key, user_id, author_name, content, status, created_at)
    values (
      'blog:building-personal-platform-nextjs',
      v_actor_id,
      v_actor_name,
      'Seeded reply from another user. This should show up in the notification center.',
      'published',
      now() - interval '90 minutes'
    );

    insert into public.comment_likes (comment_id, user_id, created_at)
    values (v_comment_id, v_actor_id, now() - interval '45 minutes')
    on conflict do nothing;
  end if;

  perform public.create_notification(
    v_owner_id,
    v_actor_id,
    'reply',
    'New reply on your post',
    coalesce(v_actor_name, 'A reader') || ' replied on Building a Personal Platform with Next.js 14 and Sanity.',
    coalesce(v_actor_name, 'Reader'),
    '',
    '/blog/building-personal-platform-nextjs#comments',
    jsonb_build_object('article_key', 'blog:building-personal-platform-nextjs', 'source', 'seed')
  );

  perform public.create_notification(
    v_owner_id,
    v_actor_id,
    'like',
    'Someone liked your comment',
    coalesce(v_actor_name, 'A reader') || ' liked your comment on Building a Personal Platform with Next.js 14 and Sanity.',
    coalesce(v_actor_name, 'Reader'),
    '',
    '/blog/building-personal-platform-nextjs#comments',
    jsonb_build_object('article_key', 'blog:building-personal-platform-nextjs', 'source', 'seed')
  );
end
$$;