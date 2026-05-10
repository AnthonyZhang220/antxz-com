import { SmallCard } from "@/components/blog/blog-list";
import { getBlogEngagementBySlugs } from "@/lib/blog/engagement";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { client } from "@/sanity/lib/client";
import { postsBySlugsQuery } from "@/sanity/lib/queries";
import type { BlogPost } from "@/types/blog";
import { getTranslations } from "next-intl/server";

type DashboardBookmarksProps = {
	locale: string;
};

const MAX_BOOKMARK_ROWS = 2;

function toSlugFromArticleKey(articleKey: string): string | null {
	if (!articleKey.startsWith("blog:")) return null;
	const slug = articleKey.replace(/^blog:/, "").trim();
	return slug ? slug : null;
}

export default async function DashboardBookmarks({ locale }: DashboardBookmarksProps) {
	const t = await getTranslations("dashboard.bookmarks");

	const supabase = await createSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user?.id) {
		return null;
	}

	const { data: bookmarkRows, error: bookmarkError } = await supabase
		.from("article_bookmarks")
		.select("article_key, created_at")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	if (bookmarkError) {
		return (
			<div className="space-y-3 p-4 lg:p-6">
				<h2 className="text-lg font-semibold">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("loadError")}</p>
			</div>
		);
	}

	const bookmarkSlugs = (bookmarkRows ?? [])
		.map((row) => toSlugFromArticleKey(String(row.article_key ?? "")))
		.filter((slug): slug is string => Boolean(slug));

	if (bookmarkSlugs.length === 0) {
		return (
			<div className="space-y-3 p-4 lg:p-6">
				<h2 className="text-lg font-semibold">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
				<div className="rounded-xl border border-border/60 bg-card p-5">
					<p className="font-medium">{t("emptyTitle")}</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{t("emptyDescription")}
					</p>
				</div>
			</div>
		);
	}

	const slugSet = Array.from(new Set(bookmarkSlugs));
	const posts = await client.fetch<BlogPost[]>(postsBySlugsQuery, {
		locale,
		slugs: slugSet,
	});
	const safePosts: BlogPost[] = posts ?? [];

	if (safePosts.length === 0) {
		return (
			<div className="space-y-3 p-4 lg:p-6">
				<h2 className="text-lg font-semibold">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
				<div className="rounded-xl border border-border/60 bg-card p-5">
					<p className="font-medium">{t("emptyTitle")}</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{t("emptyDescription")}
					</p>
				</div>
			</div>
		);
	}

	const engagementBySlug = await getBlogEngagementBySlugs(
		safePosts.map((post) => post.slug),
	);

	const articleKeys = safePosts.map((post) => `blog:${post.slug}`);
	const likedArticleKeys = new Set<string>();
	if (articleKeys.length > 0) {
		const { data: likeRows } = await supabase
			.from("article_likes")
			.select("article_key")
			.eq("user_id", user.id)
			.in("article_key", articleKeys);

		for (const row of likeRows ?? []) {
			if (typeof row.article_key === "string") {
				likedArticleKeys.add(row.article_key);
			}
		}
	}

	const postBySlug = new Map<string, BlogPost>(
		safePosts.map((post) => [post.slug, post]),
	);
	const orderedBookmarkedPosts = bookmarkSlugs
		.map((slug) => postBySlug.get(slug))
		.filter((post): post is BlogPost => Boolean(post))
		.map((post) => ({
			...post,
			commentCount: engagementBySlug[post.slug]?.commentCount ?? 0,
			likeCount: engagementBySlug[post.slug]?.likeCount ?? 0,
			userLiked: likedArticleKeys.has(`blog:${post.slug}`),
		}))
		.slice(0, MAX_BOOKMARK_ROWS);

	if (orderedBookmarkedPosts.length === 0) {
		return (
			<div className="space-y-3 p-4 lg:p-6">
				<h2 className="text-lg font-semibold">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
				<div className="rounded-xl border border-border/60 bg-card p-5">
					<p className="font-medium">{t("emptyTitle")}</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{t("emptyDescription")}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 p-4 lg:p-6">
			<div>
				<h2 className="text-lg font-semibold">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>
			<div className="rounded-xl border border-border/60 bg-card p-3 md:p-4">
				<div className="px-1 md:px-2">
					{orderedBookmarkedPosts.map((post) => (
						<SmallCard key={post._id} post={post} />
					))}
				</div>
			</div>
		</div>
	);
}