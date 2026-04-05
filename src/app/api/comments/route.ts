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
	const { data, error } = await supabase
		.from("comments")
		.select("id, article_key, author_name, content, created_at")
		.eq("article_key", articleKey)
		.eq("status", "published")
		.order("created_at", { ascending: false })
		.limit(100);

	if (error) {
		return NextResponse.json(
			{ error: "Failed to load comments", details: error.message },
			{ status: 500 },
		);
	}

	return NextResponse.json({ comments: data ?? [] });
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

	const { data, error } = await supabase
		.from("comments")
		.insert({
			article_key: articleKey,
			user_id: user.id,
			author_name: defaultName,
			content,
			status: "published",
		})
		.select("id, article_key, author_name, content, created_at")
		.single();

	if (error) {
		return NextResponse.json(
			{ error: "Failed to create comment", details: error.message },
			{ status: 500 },
		);
	}

	return NextResponse.json({ comment: data }, { status: 201 });
}
