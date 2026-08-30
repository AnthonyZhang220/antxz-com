"use server";

import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { type ActionResult, ok, err } from "@/lib/actions/action-result";
import { client as SanityClient } from "@/sanity/lib/client";
import { postBySlugQuery } from "@/sanity/lib/queries";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSupabaseErrorMessage(
	error: { code?: string; message?: string } | null,
) {
	if (!error) return "Unknown database error";
	if (error.code === "42P01") {
		return "Required engagement table is missing. Please run Supabase migrations.";
	}
	return error.message || "Unknown database error";
}

// ─── Like ─────────────────────────────────────────────────────────────────────
// 加在 getArticleLikeState 附近

export async function getLikedArticleKeys(
	articleKeys: string[],
): Promise<ActionResult<{ likedKeys: string[] }>> {
	const trimmedKeys = articleKeys
		.map((key) => String(key ?? "").trim())
		.filter(Boolean);

	if (trimmedKeys.length === 0) {
		return ok({ likedKeys: [] });
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user?.id) {
		return ok({ likedKeys: [] });
	}

	const { data: rows, error } = await supabase
		.from("article_likes")
		.select("article_key")
		.eq("user_id", user.id)
		.in("article_key", trimmedKeys);

	if (error) {
		return err(
			"ARTICLE_LIKE_STATE_LOAD_FAILED",
			formatSupabaseErrorMessage(error),
			500,
		);
	}

	const likedKeys = (rows ?? [])
		.map((row) => row.article_key)
		.filter((key): key is string => typeof key === "string");

	return ok({ likedKeys });
}

export async function getArticleLikeState(
	articleKey: string,
): Promise<ActionResult<{ likeCount: number; userLiked: boolean }>> {
	const trimmedArticleKey = String(articleKey ?? "").trim();
	if (!trimmedArticleKey) {
		return ok({ likeCount: 0, userLiked: false });
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { count, error: countError } = await supabase
		.from("article_likes")
		.select("article_key", { count: "exact", head: true })
		.eq("article_key", trimmedArticleKey);

	if (countError) {
		return err(
			"ARTICLE_LIKE_STATE_LOAD_FAILED",
			formatSupabaseErrorMessage(countError),
			500,
		);
	}

	let userLiked = false;
	if (user?.id) {
		const { data: row } = await supabase
			.from("article_likes")
			.select("article_key")
			.eq("article_key", trimmedArticleKey)
			.eq("user_id", user.id)
			.maybeSingle();
		userLiked = Boolean(row);
	}

	return ok({ likeCount: count ?? 0, userLiked });
}

export async function likeArticle(articleKey: string): Promise<ActionResult> {
	const t = await getTranslations("blog");
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return err(
			"ARTICLE_LIKE_LOGIN_REQUIRED",
			t("articleLikeLoginRequired"),
			401,
		);
	}

	const trimmedArticleKey = String(articleKey ?? "").trim();
	if (!trimmedArticleKey) {
		return err("ARTICLE_LIKE_INVALID_KEY", t("articleLikeError"), 400);
	}

	const { error } = await supabase.from("article_likes").insert({
		article_key: trimmedArticleKey,
		user_id: user.id,
	});

	if (error && error.code !== "23505") {
		return err("ARTICLE_LIKE_FAILED", formatSupabaseErrorMessage(error), 500);
	}

	return ok();
}

export async function unlikeArticle(articleKey: string): Promise<ActionResult> {
	const t = await getTranslations("blog");
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return err(
			"ARTICLE_LIKE_LOGIN_REQUIRED",
			t("articleLikeLoginRequired"),
			401,
		);
	}

	const trimmedArticleKey = String(articleKey ?? "").trim();
	if (!trimmedArticleKey) {
		return err("ARTICLE_UNLIKE_INVALID_KEY", t("articleLikeError"), 400);
	}

	const { error } = await supabase
		.from("article_likes")
		.delete()
		.eq("article_key", trimmedArticleKey)
		.eq("user_id", user.id);

	if (error) {
		return err("ARTICLE_UNLIKE_FAILED", formatSupabaseErrorMessage(error), 500);
	}

	return ok();
}

// ─── Bookmark ─────────────────────────────────────────────────────────────────

export async function getArticleBookmarkState(
	articleKey: string,
): Promise<ActionResult<{ userBookmarked: boolean }>> {
	const trimmedArticleKey = String(articleKey ?? "").trim();
	if (!trimmedArticleKey) {
		return ok({ userBookmarked: false });
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user?.id) {
		return ok({ userBookmarked: false });
	}

	const { data: row, error } = await supabase
		.from("article_bookmarks")
		.select("article_key")
		.eq("article_key", trimmedArticleKey)
		.eq("user_id", user.id)
		.maybeSingle();

	if (error) {
		return err(
			"ARTICLE_BOOKMARK_STATE_LOAD_FAILED",
			formatSupabaseErrorMessage(error),
			500,
		);
	}

	return ok({ userBookmarked: Boolean(row) });
}

export async function bookmarkArticle(
	articleKey: string,
): Promise<ActionResult> {
	const t = await getTranslations("blog");
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return err(
			"ARTICLE_BOOKMARK_LOGIN_REQUIRED",
			t("articleBookmarkLoginRequired"),
			401,
		);
	}

	const trimmedArticleKey = String(articleKey ?? "").trim();
	if (!trimmedArticleKey) {
		return err("ARTICLE_BOOKMARK_INVALID_KEY", t("articleBookmarkError"), 400);
	}

	const { error } = await supabase.from("article_bookmarks").insert({
		article_key: trimmedArticleKey,
		user_id: user.id,
	});

	if (error && error.code !== "23505") {
		return err(
			"ARTICLE_BOOKMARK_FAILED",
			formatSupabaseErrorMessage(error),
			500,
		);
	}

	return ok();
}

export async function unbookmarkArticle(
	articleKey: string,
): Promise<ActionResult> {
	const t = await getTranslations("blog");
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return err(
			"ARTICLE_BOOKMARK_LOGIN_REQUIRED",
			t("articleBookmarkLoginRequired"),
			401,
		);
	}

	const trimmedArticleKey = String(articleKey ?? "").trim();
	if (!trimmedArticleKey) {
		return err(
			"ARTICLE_UNBOOKMARK_INVALID_KEY",
			t("articleBookmarkError"),
			400,
		);
	}

	const { error } = await supabase
		.from("article_bookmarks")
		.delete()
		.eq("article_key", trimmedArticleKey)
		.eq("user_id", user.id);

	if (error) {
		return err(
			"ARTICLE_UNBOOKMARK_FAILED",
			formatSupabaseErrorMessage(error),
			500,
		);
	}

	return ok();
}

export async function getTranslatedPost(
	slug: string,
	locale: string,
	contentLang: string | null,
) {
	if (!SanityClient) return err("500", "SanityClient Not Found");

	const translatedPost = await SanityClient.fetch(
		postBySlugQuery,
		{ slug, locale, contentLang },
		{ next: { tags: [`post: ${slug}`] } },
	);

	if (!translatedPost) return err("400", "Can't find post");

	return ok({ translatedPost });
}
