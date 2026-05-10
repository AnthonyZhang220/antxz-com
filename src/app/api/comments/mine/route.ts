import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data, error } = await supabase
		.from("comments")
		.select("id, article_key, author_name, avatar_url, content, status, created_at, parent_id")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.limit(100);

	if (error) {
		return NextResponse.json(
			{ error: "Failed to load comments", details: error.message },
			{ status: 500 },
		);
	}

	// Fetch like counts for each comment
	const commentIds = (data ?? []).map((c) => String(c.id));
	const likeCountMap = new Map<string, number>();

	if (commentIds.length > 0) {
		const { data: likes } = await supabase
			.from("comment_likes")
			.select("comment_id")
			.in("comment_id", commentIds);

		for (const like of likes ?? []) {
			const id = String(like.comment_id);
			likeCountMap.set(id, (likeCountMap.get(id) ?? 0) + 1);
		}
	}

	return NextResponse.json({
		comments: (data ?? []).map((c) => ({
			id: c.id,
			article_key: c.article_key,
			author_name: c.author_name,
			avatar_url: c.avatar_url,
			content: c.content,
			status: c.status,
			created_at: c.created_at,
			parent_id: c.parent_id ?? null,
			like_count: likeCountMap.get(String(c.id)) ?? 0,
		})),
	});
}
