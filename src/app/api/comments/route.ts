import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
	const articleKey = req.nextUrl.searchParams.get("articleKey");

	if (!articleKey) {
		return NextResponse.json(
			{ error: "Missing articleKey" },
			{ status: 400 },
		);
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	let query = supabase
		.from("comments")
		.select("id, article_key, author_name, avatar_url, content, created_at, status, user_id, parent_id")
		.eq("article_key", articleKey)
		.order("created_at", { ascending: true })
		.limit(200);

	if (user?.id) {
		query = query.or(`status.eq.published,and(status.eq.quarantine,user_id.eq.${user.id})`);
	} else {
		query = query.eq("status", "published");
	}

	const { data, error } = await query;

	if (error) {
		return NextResponse.json(
			{ error: "Failed to load comments", details: error.message },
			{ status: 500 },
		);
	}

	const commentIds = (data ?? []).map((comment) => String(comment.id));
	const likeCountByCommentId = new Map<string, number>();
	const likersByCommentId = new Map<string, Array<{ user_id: string; avatar_url: string; author_name: string }>>();
	const userLikedCommentIds = new Set<string>();

	if (commentIds.length > 0) {
		const { data: likes } = await supabase
			.from("comment_likes")
			.select("comment_id, user_id, avatar_url, author_name")
			.in("comment_id", commentIds);

		for (const like of likes ?? []) {
			const commentId = String(like.comment_id);
			likeCountByCommentId.set(commentId, (likeCountByCommentId.get(commentId) ?? 0) + 1);
			if (user?.id && like.user_id === user.id) {
				userLikedCommentIds.add(commentId);
			}
			const arr = likersByCommentId.get(commentId) ?? [];
			arr.push({
				user_id: String(like.user_id),
				avatar_url: String(like.avatar_url ?? ""),
				author_name: String(like.author_name ?? "User"),
			});
			likersByCommentId.set(commentId, arr);
		}
	}

	return NextResponse.json({
		currentUserId: user?.id ?? null,
		comments: (data ?? []).map((comment) => ({
			id: comment.id,
			article_key: comment.article_key,
			author_name: comment.author_name,
			avatar_url: comment.avatar_url,
			content: comment.content,
			created_at: comment.created_at,
			status: comment.status,
			user_id: comment.user_id,
			parent_id: comment.parent_id ?? null,
			like_count: likeCountByCommentId.get(String(comment.id)) ?? 0,
			user_liked: userLikedCommentIds.has(String(comment.id)),
			likers: likersByCommentId.get(String(comment.id)) ?? [],
		})),
	});
}
