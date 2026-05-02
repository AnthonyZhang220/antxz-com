import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function formatSupabaseErrorMessage(error: { code?: string; message?: string } | null) {
	if (!error) return "Unknown database error";
	if (error.code === "42P01") {
		return "article_likes table is missing. Please run Supabase migrations.";
	}
	return error.message || "Unknown database error";
}

export async function GET(req: NextRequest) {
	const articleKey = String(req.nextUrl.searchParams.get("articleKey") ?? "").trim();
	if (!articleKey) {
		return NextResponse.json({ error: "articleKey is required" }, { status: 400 });
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { count, error: countError } = await supabase
		.from("article_likes")
		.select("article_key", { count: "exact", head: true })
		.eq("article_key", articleKey);

	if (countError) {
		return NextResponse.json(
			{ error: "Failed to load article likes", details: formatSupabaseErrorMessage(countError) },
			{ status: 500 },
		);
	}

	let userLiked = false;
	if (user?.id) {
		const { data: row } = await supabase
			.from("article_likes")
			.select("article_key")
			.eq("article_key", articleKey)
			.eq("user_id", user.id)
			.maybeSingle();
		userLiked = Boolean(row);
	}

	return NextResponse.json({
		articleKey,
		likeCount: count ?? 0,
		userLiked,
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
	if (!articleKey) {
		return NextResponse.json({ error: "articleKey is required" }, { status: 400 });
	}

	const { error } = await supabase.from("article_likes").insert({
		article_key: articleKey,
		user_id: user.id,
	});

	if (error && error.code !== "23505") {
		return NextResponse.json(
			{ error: "Failed to like article", details: formatSupabaseErrorMessage(error) },
			{ status: 500 },
		);
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
	const articleKey = String(body?.articleKey ?? "").trim();
	if (!articleKey) {
		return NextResponse.json({ error: "articleKey is required" }, { status: 400 });
	}

	const { error } = await supabase
		.from("article_likes")
		.delete()
		.eq("article_key", articleKey)
		.eq("user_id", user.id);

	if (error) {
		return NextResponse.json(
			{ error: "Failed to unlike article", details: formatSupabaseErrorMessage(error) },
			{ status: 500 },
		);
	}

	return NextResponse.json({ success: true, liked: false });
}
