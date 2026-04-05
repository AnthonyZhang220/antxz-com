import { client } from "@/sanity/lib/client";
import { allPostSlugsQuery, postBySlugQuery } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import BlogPostPage from "@/components/blog/blog-post";
import BlogComments from "@/components/blog/blog-comments";
import { samplePosts } from "@/data/sample-data";

interface Props {
	params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
	const slugs = await client.fetch(allPostSlugsQuery);
	// Also include sample post slugs for development
	const sampleSlugs = samplePosts.map((p) => ({ slug: p.slug }));
	return [...slugs.map(({ slug }: { slug: string }) => ({ slug })), ...sampleSlugs];
}

export default async function Page({ params }: Props) {
	const { slug } = await params;
	// Try Sanity first, fall back to sample data for development
	let post = await client.fetch(postBySlugQuery, { slug });
	if (!post) {
		post = samplePosts.find((p) => p.slug === slug) ?? null;
	}
	if (!post) notFound();

	return (
		<>
			<BlogPostPage post={post} />
			<div className="mx-auto max-w-3xl px-5 sm:px-8">
				<BlogComments articleKey={`blog:${slug}`} />
			</div>
		</>
	);
}
