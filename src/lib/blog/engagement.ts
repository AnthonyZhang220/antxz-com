import { createClient } from "@supabase/supabase-js";

export interface BlogEngagement {
	commentCount: number;
	likeCount: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase =
	supabaseUrl && supabaseAnonKey
		? createClient(supabaseUrl, supabaseAnonKey)
		: null;

const EMPTY_ENGAGEMENT: BlogEngagement = {
	commentCount: 0,
	likeCount: 0,
};

function toArticleKey(slug: string) {
	return `blog:${slug}`;
}

function toSlug(articleKey: string) {
	return articleKey.replace(/^blog:/, "");
}

export async function getBlogEngagementBySlugs(slugs: string[]) {
	const normalizedSlugs = Array.from(
		new Set(slugs.map((slug) => String(slug).trim()).filter(Boolean)),
	);

	if (normalizedSlugs.length === 0) {
		return {} as Record<string, BlogEngagement>;
	}

	if (!supabase) {
		return normalizedSlugs.reduce<Record<string, BlogEngagement>>((acc, slug) => {
			acc[slug] = EMPTY_ENGAGEMENT;
			return acc;
		}, {});
	}

	const articleKeys = normalizedSlugs.map(toArticleKey);

	const { data: comments, error: commentsError } = await supabase
		.from("comments")
		.select("id, article_key")
		.in("article_key", articleKeys)
		.eq("status", "published");

	if (commentsError) {
		return normalizedSlugs.reduce<Record<string, BlogEngagement>>((acc, slug) => {
			acc[slug] = EMPTY_ENGAGEMENT;
			return acc;
		}, {});
	}

	const result = normalizedSlugs.reduce<Record<string, BlogEngagement>>((acc, slug) => {
		acc[slug] = { ...EMPTY_ENGAGEMENT };
		return acc;
	}, {});

	for (const comment of comments ?? []) {
		const slug = toSlug(String(comment.article_key));
		if (!result[slug]) continue;
		result[slug].commentCount += 1;
	}

	const { data: articleLikes } = await supabase
		.from("article_likes")
		.select("article_key")
		.in("article_key", articleKeys);

	for (const like of articleLikes ?? []) {
		const slug = toSlug(String(like.article_key));
		if (!result[slug]) continue;
		result[slug].likeCount += 1;
	}

	return result;
}

export async function getBlogEngagementBySlug(slug: string) {
	const bySlug = await getBlogEngagementBySlugs([slug]);
	return bySlug[slug] ?? { ...EMPTY_ENGAGEMENT };
}
