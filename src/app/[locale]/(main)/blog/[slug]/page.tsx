import { client } from "@/sanity/lib/client";
import { allPostSlugsQuery, postBySlugQuery } from "@/sanity/lib/queries";
import { getBlogEngagementBySlug } from "@/lib/blog/engagement";
import { notFound } from "next/navigation";
import BlogPostPage from "@/components/blog/blog-post";
import BlogComments from "@/components/blog/blog-comments";

interface BlogPostProps {
	params: Promise<{ slug: string; locale: string }>;
	searchParams?: Promise<{ lang?: string }>;
}

// export async function generateStaticParams() {
// 	const slugs = await client.fetch(allPostSlugsQuery);
// 	return slugs.map(({ slug }: { slug: string }) => ({ slug }));
// }

export default async function Page({ params, searchParams }: BlogPostProps) {
	const { slug, locale } = await params;
	const resolvedSearchParams = (await searchParams) ?? {};
	const requestedLang = resolvedSearchParams.lang;
	const contentLang =
		requestedLang === "en" || requestedLang === "zh"
			? requestedLang
			: locale === "zh"
				? "zh"
				: "en";
	const post = await client.fetch(postBySlugQuery, {
		slug,
		locale,
		contentLang,
	});
	if (!post) notFound();
	const engagement = await getBlogEngagementBySlug(slug);
	const postWithEngagement = {
		...post,
		commentCount: engagement.commentCount,
		likeCount: engagement.likeCount,
	};

	return (
		<>
			<BlogPostPage
				routeLocale={locale === "zh" ? "zh" : "en"}
				contentLang={contentLang}
				post={postWithEngagement}
			/>
			<div id="comments" className="mx-auto max-w-4xl scroll-mt-24 px-5 sm:px-8">
				<BlogComments articleKey={`blog:${slug}`} />
			</div>
		</>
	);
}
