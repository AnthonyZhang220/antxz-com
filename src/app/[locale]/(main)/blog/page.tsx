import type { Metadata } from "next";
import BlogListPage from "@/components/blog/blog-list";
import { getBlogEngagementBySlugs } from "@/lib/blog/engagement";
import { client } from "@/sanity/lib/client";
import { allPostsQuery } from "@/sanity/lib/queries";
import type { BlogPost } from "@/lib/types/blog";

interface BlogPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({
	params,
}: BlogPageProps): Promise<Metadata> {
	const { locale } = await params;
	const canonicalUrl = `https://antxz.com/${locale}/blog`;

	return {
		title: locale === "zh" ? "博客" : "Blog",
		description:
			locale === "zh"
				? "技术文章、项目分享与思考"
				: "Technical articles, project write-ups and thoughts",
		alternates: {
			canonical: canonicalUrl,
			languages: {
				en: "https://antxz.com/en/blog",
				zh: "https://antxz.com/zh/blog",
			},
		},
		openGraph: {
			title: locale === "zh" ? "博客 | ANTXZ" : "Blog | ANTXZ",
			description:
				locale === "zh"
					? "技术文章、项目分享与思考"
					: "Technical articles, project write-ups and thoughts",
			url: canonicalUrl,
			siteName: "ANTXZ",
			locale: locale === "zh" ? "zh_CN" : "en_US",
		},
	};
}

export default async function Home({ params }: BlogPageProps) {
	const { locale } = await params;
	const posts = await client.fetch<BlogPost[]>(
		allPostsQuery,
		{ locale },
		{ next: { revalidate: 86400 } },
	);
	const safePosts: BlogPost[] = posts ?? [];
	const engagementBySlug = await getBlogEngagementBySlugs(
		safePosts.map((post) => post.slug),
	);

	const postsWithEngagement = safePosts.map((post) => ({
		...post,
		commentCount: engagementBySlug[post.slug]?.commentCount ?? 0,
		likeCount: engagementBySlug[post.slug]?.likeCount ?? 0,
		userLiked: false,
	}));
	const allTags = Array.from(
		new Set(postsWithEngagement.flatMap((post) => post.tags || [])),
	);
	const years = postsWithEngagement.map((post) =>
		new Date(post.publishedAt).getFullYear(),
	);
	const currentYear = new Date().getFullYear();
	const minYear = years.length > 0 ? Math.min(...years) : currentYear;
	const maxYear = years.length > 0 ? Math.max(...years) : currentYear;

	return (
		<main>
			<BlogListPage
				posts={postsWithEngagement}
				allTags={allTags}
				minYear={minYear}
				maxYear={maxYear}
			/>
		</main>
	);
}
