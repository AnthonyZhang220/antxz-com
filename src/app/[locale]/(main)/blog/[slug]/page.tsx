import { client } from "@/sanity/lib/client";
import { allPostSlugsQuery, postBySlugQuery } from "@/sanity/lib/queries";
import { getBlogEngagementBySlug } from "@/lib/blog/engagement";
import { notFound } from "next/navigation";
import BlogPostPage from "@/components/blog/blog-post";
import BlogComments from "@/components/blog/blog-comments";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { getCommentsByArticleKey } from "@/lib/actions/comments";

interface BlogPostProps {
	params: Promise<{ slug: string; locale: string }>;
	searchParams?: Promise<{ lang?: string }>;
}

export async function generateStaticParams() {
	const slugs = await client.fetch<Array<{ slug: string }>>(allPostSlugsQuery);
	const locales = ["en", "zh"];
	return locales.flatMap((locale) =>
		slugs.map(({ slug }) => ({ slug, locale })),
	);
}

export default async function Page({ params, searchParams }: BlogPostProps) {
	const supabase = await createSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { slug, locale } = await params;
	const resolvedSearchParams = (await searchParams) ?? {};
	const requestedLang = resolvedSearchParams.lang;
	const contentLang =
		requestedLang === "en" || requestedLang === "zh"
			? requestedLang
			: locale === "zh"
				? "zh"
				: "en";

	const articleKeys = `blog:${slug}`;

	const [post, engagement] = await Promise.all([
		client.fetch(postBySlugQuery, {
			slug,
			locale,
			contentLang,
		}),
		getBlogEngagementBySlug(slug),
	]);

	if (!post) notFound();

	const postWithEngagement = {
		...post,
		commentCount: engagement.commentCount,
		likeCount: engagement.likeCount,
	};

	const commentResult = await getCommentsByArticleKey(
		articleKeys,
		user?.id ?? null,
	);
	console.error("Comment fetch result:", commentResult);

	const comments = commentResult.success ? commentResult.data : [];

	return (
		<>
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
					articleKey={articleKeys}
					initialComments={comments}
				/>
			</div>
		</>
	);
}
