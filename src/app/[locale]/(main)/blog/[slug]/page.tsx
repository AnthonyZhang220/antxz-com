import { client } from "@/sanity/lib/client";
import { allPostSlugsQuery, postBySlugQuery } from "@/sanity/lib/queries";
import { getBlogEngagementBySlug } from "@/lib/blog-engagement";
import { notFound } from "next/navigation";
import BlogPostPage from "@/components/blog/blog-post";
import BlogComments from "@/components/blog/blog-comments";

interface Props {
	params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
	const slugs = await client.fetch(allPostSlugsQuery);
	return slugs.map(({ slug }: { slug: string }) => ({ slug }));
}

export default async function Page({ params }: Props) {
	const { slug, locale } = await params;
	const post = await client.fetch(postBySlugQuery, { slug, locale });
	if (!post) notFound();
	const engagement = await getBlogEngagementBySlug(slug);
	const postWithEngagement = {
		...post,
		commentCount: engagement.commentCount,
		likeCount: engagement.likeCount,
	};

	return (
		<>
			<BlogPostPage post={postWithEngagement} />
			<div className="mx-auto max-w-3xl px-5 sm:px-8">
				<BlogComments articleKey={`blog:${slug}`} />
			</div>
		</>
	);
}
