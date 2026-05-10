-- Add parent_id to comments for threaded replies
-- on delete set null: if parent is deleted, replies become orphaned top-level comments
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id uuid references public.comments(id) on delete set null;

CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);

-- Add liker profile info to comment_likes for avatar group display
ALTER TABLE public.comment_likes
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS author_name text;
