import { client } from "@/sanity/lib/client";
import { postBySlugQuery } from "@/sanity/lib/queries";
import { getBlogEngagementBySlug } from "@/lib/blog/engagement";
import { notFound } from "next/navigation";
import BlogPostPage from "@/components/blog/blog-post";
import BlogComments from "@/components/blog/blog-comments";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { getCommentsByArticleKey } from "@/lib/actions/comments";
import type { Metadata } from "next";
import { JsonLd } from "@/components/shared/json-ld";
import type { Article, WithContext } from "schema-dts";
import { cache } from "react";

interface BlogPostProps {
	params: Promise<{ slug: string; locale: string }>;
	searchParams?: Promise<{ lang?: string }>;
}

const getPost = cache(
	async (slug: string, locale: string, contentLang: string) =>
		client.fetch(
			postBySlugQuery,
			{ slug, locale, contentLang },
			{ next: { tags: [`post:${slug}`] } },
		),
);

function resolveContentLang(
	lang: string | undefined,
	locale: string,
): "en" | "zh" {
	if (lang === "en" || lang === "zh") return lang;
	return locale === "zh" ? "zh" : "en";
}

export async function generateMetadata({
	params,
	searchParams,
}: BlogPostProps): Promise<Metadata> {
	const { slug, locale } = await params;
	const { lang } = (await searchParams) ?? {};
	const contentLang = resolveContentLang(lang, locale);

	const post = await getPost(slug, locale, contentLang);
	if (!post) return {};

	const canonicalUrl = `https://antxz.com/${locale}/blog/${slug}`;

	return {
		title: post.title,
		description: post.excerpt,
		authors: [
			{ name: post.author?.name ?? "Anthony Zhang", url: "https://antxz.com" },
		],
		keywords: post.tags ?? [],
		alternates: {
			canonical: canonicalUrl,
			languages: {
				en: `https://antxz.com/en/blog/${slug}`,
				zh: `https://antxz.com/zh/blog/${slug}`,
			},
		},
		openGraph: {
			title: post.title,
			description: post.excerpt,
			type: "article",
			url: canonicalUrl,
			siteName: "ANTXZ",
			locale: locale === "zh" ? "zh_CN" : "en_US",
			publishedTime: post.publishedAt,
			modifiedTime: post._updatedAt,
			tags: post.tags ?? [],
			images: post.coverImage?.url
				? [
						{
							url: post.coverImage.url,
							width: 1200,
							height: 630,
							alt: post.title,
						},
					]
				: [{ url: "https://antxz.com/og-image.png", width: 1200, height: 630 }],
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description: post.excerpt,
			images: post.coverImage?.url
				? [post.coverImage.url]
				: ["https://antxz.com/og-image.png"],
		},
	};
}

export default async function Page({ params, searchParams }: BlogPostProps) {
	const { slug, locale } = await params;
	const { lang } = (await searchParams) ?? {};
	const contentLang = resolveContentLang(lang, locale);
	const articleKey = `blog:${slug}`;

	const supabase = await createSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const [post, engagement] = await Promise.all([
		getPost(slug, locale, contentLang),
		getBlogEngagementBySlug(slug),
	]);

	if (!post) notFound();

	const postWithEngagement = {
		...post,
		commentCount: engagement.commentCount,
		likeCount: engagement.likeCount,
	};

	const commentResult = await getCommentsByArticleKey(
		articleKey,
		user?.id ?? null,
	);
	const comments = commentResult.success ? commentResult.data : [];

	const jsonLd: WithContext<Article> = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: post.title,
		description: post.excerpt,
		datePublished: post.publishedAt,
		dateModified: post._updatedAt,
		author: { "@type": "Person", name: post.author?.name },
		image: post.coverImage?.url,
		url: `https://antxz.com/${locale}/blog/${slug}`,
	};

	return (
		<>
			<JsonLd jsonLd={jsonLd} />
			<BlogPostPage
				routeLocale={locale === "zh" ? "zh" : "en"}
				contentLang={contentLang}
				post={postWithEngagement}
			/>
			<div
				id="comments"
				className="mx-auto max-w-4xl scroll-mt-24 px-5 sm:px-8"
			>
				<BlogComments
					initialUser={user}
					articleKey={articleKey}
					initialComments={comments}
				/>
			</div>
		</>
	);
}
