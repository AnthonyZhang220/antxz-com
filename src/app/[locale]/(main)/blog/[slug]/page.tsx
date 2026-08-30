import { client } from "@/sanity/lib/client";
import { postBySlugQuery } from "@/sanity/lib/queries";
import { getBlogEngagementBySlug } from "@/lib/blog/engagement";
import { notFound } from "next/navigation";
import BlogPostPage from "@/components/blog/blog-post";
import BlogComments from "@/components/blog/blog-comments";
import type { Metadata } from "next";
import { JsonLd } from "@/components/shared/json-ld";
import type { Article, WithContext } from "schema-dts";
import { cache } from "react";
import { allPostSlugsQuery } from "@/sanity/lib/queries";

interface BlogPostProps {
	params: Promise<{ slug: string; locale: string }>;
}

const getPost = cache(
	async (slug: string, locale: string, contentLang: string) =>
		client.fetch(
			postBySlugQuery,
			{ slug, locale, contentLang },
			{ next: { tags: [`post:${slug}`] } },
		),
);

export async function generateMetadata({
	params,
}: BlogPostProps): Promise<Metadata> {
	const { slug, locale } = await params;

	const post = await getPost(slug, locale, locale);
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

export async function generateStaticParams() {
	const posts = await client.fetch(allPostSlugsQuery);

	return posts.flatMap((post: { slug: string }) => [
		{ locale: "en", slug: post.slug },
		{ locale: "zh", slug: post.slug },
	]);
}

export default async function Page({ params }: BlogPostProps) {
	const { slug, locale } = await params;
	const articleKey = `blog:${slug}`;

	const [post, engagement] = await Promise.all([
		getPost(slug, locale, locale),
		getBlogEngagementBySlug(slug),
	]);

	if (!post) notFound();

	const postWithEngagement = {
		...post,
		commentCount: engagement.commentCount,
		likeCount: engagement.likeCount,
	};

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
			<BlogPostPage post={postWithEngagement} />
			<div
				id="comments"
				className="mx-auto max-w-4xl scroll-mt-24 px-5 sm:px-8"
			>
				<BlogComments articleKey={articleKey} />
			</div>
		</>
	);
}
