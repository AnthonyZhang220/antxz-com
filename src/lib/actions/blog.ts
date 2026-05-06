"use server";

import { getTranslations } from "next-intl/server";
import { createActionError } from "@/lib/errors/action-error";

import { createClient } from "@/lib/supabase/server";

function formatSupabaseErrorMessage(error: { code?: string; message?: string } | null) {
	if (!error) return "Unknown database error";
	if (error.code === "42P01") {
		return "article_likes table is missing. Please run Supabase migrations.";
	}
	return error.message || "Unknown database error";
}

export async function getArticleLikeState(articleKey: string): Promise<{ likeCount: number; userLiked: boolean }> {
	const trimmedArticleKey = String(articleKey ?? "").trim();
	if (!trimmedArticleKey) {
		return { likeCount: 0, userLiked: false };
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
		throw createActionError(
			"ARTICLE_LIKE_STATE_LOAD_FAILED",
			formatSupabaseErrorMessage(countError),
			{ status: 500 },
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

	return {
		likeCount: count ?? 0,
		userLiked,
	};
}

export async function likeArticle(articleKey: string): Promise<void> {
	const t = await getTranslations("blog");
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		throw createActionError("ARTICLE_LIKE_LOGIN_REQUIRED", t("articleLikeLoginRequired"), { status: 401 });
	}

	const trimmedArticleKey = String(articleKey ?? "").trim();
	if (!trimmedArticleKey) {
		throw createActionError("ARTICLE_LIKE_INVALID_KEY", t("articleLikeError"), { status: 400 });
	}

	const { error } = await supabase.from("article_likes").insert({
		article_key: trimmedArticleKey,
		user_id: user.id,
	});

	if (error && error.code !== "23505") {
		throw createActionError("ARTICLE_LIKE_FAILED", formatSupabaseErrorMessage(error), { status: 500 });
	}
}

export async function unlikeArticle(articleKey: string): Promise<void> {
	const t = await getTranslations("blog");
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		throw createActionError("ARTICLE_LIKE_LOGIN_REQUIRED", t("articleLikeLoginRequired"), { status: 401 });
	}

	const trimmedArticleKey = String(articleKey ?? "").trim();
	if (!trimmedArticleKey) {
		throw createActionError("ARTICLE_UNLIKE_INVALID_KEY", t("articleLikeError"), { status: 400 });
	}

	const { error } = await supabase
		.from("article_likes")
		.delete()
		.eq("article_key", trimmedArticleKey)
		.eq("user_id", user.id);

	if (error) {
		throw createActionError("ARTICLE_UNLIKE_FAILED", formatSupabaseErrorMessage(error), { status: 500 });
	}
}
