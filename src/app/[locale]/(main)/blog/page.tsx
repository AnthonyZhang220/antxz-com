import BlogListPage from "@/components/blog/blog-list";

import { samplePosts } from "@/data/sample-data";

export default function Home() {
	const allTags = Array.from(
		new Set(samplePosts.flatMap((post) => post.tags || [])),
	);
	const years = samplePosts.map((post) =>
		new Date(post.publishedAt).getFullYear(),
	);
	const minYear = Math.min(...years);
	const maxYear = Math.max(...years);

	return (
		<main>
			<BlogListPage
				posts={samplePosts}
				allTags={allTags}
				minYear={minYear}
				maxYear={maxYear}
			/>
		</main>
	);
}
