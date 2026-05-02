import { NextRequest, NextResponse } from "next/server";

import { isCommentAdminUser } from "@/lib/comment-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const manageableStatuses = new Set(["published", "quarantine", "spam", "blocked"]);

async function requireAdmin() {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user || !isCommentAdminUser(user)) {
		return null;
	}

	return user;
}

export async function GET() {
	const adminUser = await requireAdmin();
	if (!adminUser) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("comments")
		.select("id, article_key, user_id, author_name, avatar_url, content, status, created_at")
		.in("status", ["quarantine", "spam", "blocked"])
		.order("created_at", { ascending: false })
		.limit(100);

	if (error) {
		return NextResponse.json(
			{ error: "Failed to load admin comments", details: error.message },
			{ status: 500 },
		);
	}

	return NextResponse.json({ comments: data ?? [] });
}

export async function POST(req: NextRequest) {
	const adminUser = await requireAdmin();
	if (!adminUser) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const body = await req.json();
	const action = String(body?.action ?? "").trim();
	const commentId = String(body?.commentId ?? "").trim();
	const userId = String(body?.userId ?? "").trim();
	const status = String(body?.status ?? "").trim();

	const supabase = createAdminClient();

	if (action === "delete-comment") {
		if (!commentId) {
			return NextResponse.json({ error: "commentId is required" }, { status: 400 });
		}

		const { error } = await supabase.from("comments").delete().eq("id", commentId);
		if (error) {
			return NextResponse.json(
				{ error: "Failed to delete comment", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	}

	if (action === "set-status") {
		if (!commentId || !manageableStatuses.has(status)) {
			return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
		}

		const { error } = await supabase
			.from("comments")
			.update({ status })
			.eq("id", commentId);

		if (error) {
			return NextResponse.json(
				{ error: "Failed to update comment status", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	}

	if (action === "block-user") {
		if (!userId) {
			return NextResponse.json({ error: "userId is required" }, { status: 400 });
		}

		const { error: blockError } = await supabase
			.from("comment_blocked_users")
			.upsert({
				user_id: userId,
				blocked_by: adminUser.id,
			});

		if (blockError) {
			return NextResponse.json(
				{ error: "Failed to block user", details: blockError.message },
				{ status: 500 },
			);
		}

		const { error: updateError } = await supabase
			.from("comments")
			.update({ status: "blocked" })
			.eq("user_id", userId)
			.in("status", ["published", "quarantine", "spam"]);

		if (updateError) {
			return NextResponse.json(
				{ error: "Failed to update blocked user comments", details: updateError.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	}

	return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
