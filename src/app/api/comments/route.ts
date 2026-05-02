import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { moderateComment } from "@/lib/comment-moderation";
import {
	createNotification,
	getActorProfile,
	getArticleNotificationTarget,
	getBlogTargetUrl,
} from "@/lib/notifications";

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
		.select("id, article_key, author_name, avatar_url, content, created_at, status, user_id")
		.eq("article_key", articleKey)
		.order("created_at", { ascending: false })
		.limit(100);

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
	const likesByCommentId = new Map<string, number>();
	const userLikedCommentIds = new Set<string>();

	if (commentIds.length > 0) {
		const { data: likes } = await supabase
			.from("comment_likes")
			.select("comment_id, user_id")
			.in("comment_id", commentIds);

		for (const like of likes ?? []) {
			const commentId = String(like.comment_id);
			likesByCommentId.set(commentId, (likesByCommentId.get(commentId) ?? 0) + 1);
			if (user?.id && like.user_id === user.id) {
				userLikedCommentIds.add(commentId);
			}
		}
	}

	return NextResponse.json({
		comments: (data ?? []).map((comment) => ({
			id: comment.id,
			article_key: comment.article_key,
			author_name: comment.author_name,
			avatar_url: comment.avatar_url,
			content: comment.content,
			created_at: comment.created_at,
			status: comment.status,
			like_count: likesByCommentId.get(String(comment.id)) ?? 0,
			user_liked: userLikedCommentIds.has(String(comment.id)),
		})),
	});
}

export async function POST(req: NextRequest) {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const articleKey = String(body?.articleKey ?? "").trim();
	const content = String(body?.content ?? "").trim();

	if (!articleKey || !content) {
		return NextResponse.json(
			{ error: "articleKey and content are required" },
			{ status: 400 },
		);
	}

	if (content.length > 4000) {
		return NextResponse.json(
			{ error: "Comment is too long" },
			{ status: 400 },
		);
	}

	const defaultName =
		user.user_metadata?.full_name ||
		user.user_metadata?.name ||
		user.email?.split("@")[0] ||
		"User";
	const defaultAvatarUrl =
		String(user.user_metadata?.avatar_url || user.user_metadata?.picture || "");
	const { data: blockedUser } = await supabase
		.from("comment_blocked_users")
		.select("user_id")
		.eq("user_id", user.id)
		.maybeSingle();
	const { data: recentComments } = await supabase
		.from("comments")
		.select("content, created_at")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.limit(5);
	const moderation = blockedUser
		? { status: "blocked" as const, reasons: ["blocked_user"] }
		: moderateComment({
			content,
			articleKey,
			userId: user.id,
			recentComments: recentComments ?? [],
		});

	const { data, error } = await supabase
		.from("comments")
		.insert({
			article_key: articleKey,
			user_id: user.id,
			author_name: defaultName,
			avatar_url: defaultAvatarUrl,
			content,
			status: moderation.status,
		})
		.select("id, article_key, author_name, avatar_url, content, created_at, status")
		.single();

	if (error) {
		return NextResponse.json(
			{ error: "Failed to create comment", details: error.message },
			{ status: 500 },
		);
	}

	const articleTargetUserId = await getArticleNotificationTarget(articleKey);
	if (data.status === "published" && articleTargetUserId && articleTargetUserId !== user.id) {
		const actor = getActorProfile(user);
		await createNotification({
			userId: articleTargetUserId,
			actorUserId: user.id,
			type: "reply",
			title: "New reply on your post",
			message: `${actor.name} replied: ${content.slice(0, 140)}`,
			actorName: actor.name,
			actorAvatarUrl: actor.avatarUrl,
			targetUrl: getBlogTargetUrl(articleKey),
			metadata: {
				article_key: articleKey,
				comment_id: data.id,
				event: "comment_created",
			},
		});
	}

	return NextResponse.json({ comment: data, moderation }, { status: 201 });
}
