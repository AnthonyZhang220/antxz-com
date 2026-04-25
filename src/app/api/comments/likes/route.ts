import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
	createNotification,
	getActorProfile,
	getBlogTargetUrl,
} from "@/lib/notifications";

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
	const commentId = String(body?.commentId ?? "").trim();

	if (!commentId) {
		return NextResponse.json(
			{ error: "commentId is required" },
			{ status: 400 }
		);
	}

	const { data: comment, error: commentError } = await supabase
		.from("comments")
		.select("id, article_key, user_id, author_name")
		.eq("id", commentId)
		.maybeSingle();

	if (commentError || !comment) {
		return NextResponse.json(
			{ error: "Comment not found" },
			{ status: 404 }
		);
	}

	const { error } = await supabase.from("comment_likes").insert({
		comment_id: commentId,
		user_id: user.id,
	});

	if (error) {
		if (error.code === "23505") {
			return NextResponse.json({ success: true, liked: true });
		}

		return NextResponse.json(
			{ error: "Failed to like comment", details: error.message },
			{ status: 500 }
		);
	}

	if (comment.user_id && comment.user_id !== user.id) {
		const actor = getActorProfile(user);
		await createNotification({
			userId: String(comment.user_id),
			actorUserId: user.id,
			type: "like",
			title: "Someone liked your comment",
			message: `${actor.name} liked your comment on ${String(comment.article_key).replace(/^blog:/, "")}.`,
			actorName: actor.name,
			actorAvatarUrl: actor.avatarUrl,
			targetUrl: getBlogTargetUrl(String(comment.article_key)),
			metadata: {
				article_key: comment.article_key,
				comment_id: comment.id,
				event: "comment_like",
			},
		});
	}

	return NextResponse.json({ success: true, liked: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const commentId = String(body?.commentId ?? "").trim();

	if (!commentId) {
		return NextResponse.json(
			{ error: "commentId is required" },
			{ status: 400 }
		);
	}

	const { error } = await supabase
		.from("comment_likes")
		.delete()
		.eq("comment_id", commentId)
		.eq("user_id", user.id);

	if (error) {
		return NextResponse.json(
			{ error: "Failed to unlike comment", details: error.message },
			{ status: 500 }
		);
	}

	return NextResponse.json({ success: true, liked: false });
}