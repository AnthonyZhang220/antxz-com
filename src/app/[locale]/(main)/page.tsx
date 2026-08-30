import type { Metadata } from "next";
import Hero from "@/components/hero";
import Intro from "@/components/intro";
import Blogs from "@/components/blog/blogs";
import { client } from "@/sanity/lib/client";
import { allPostsQuery } from "@/sanity/lib/queries";
interface MainPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({
	params,
}: MainPageProps): Promise<Metadata> {
	const { locale } = await params;
	const canonicalUrl = `https://antxz.com/${locale}`;

	return {
		alternates: {
			canonical: canonicalUrl,
			languages: {
				en: "https://antxz.com/en",
				zh: "https://antxz.com/zh",
			},
		},
		openGraph: {
			url: canonicalUrl,
			siteName: "ANTXZ",
			locale: locale === "zh" ? "zh_CN" : "en_US",
		},
	};
}

export default async function Home({ params }: MainPageProps) {
	const { locale } = await params;
	const posts = await client.fetch(
		allPostsQuery,
		{ locale },
		{ next: { revalidate: 86400, tags: ["post"] } },
	);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "ANTXZ",
		url: "https://antxz.com",
		description:
			locale === "zh"
				? "Anthony Zhang 的个人网站 — 开发者、创作者"
				: "Anthony Zhang's personal site — developer and creator",
		inLanguage: locale === "zh" ? "zh-CN" : "en",
		author: {
			"@type": "Person",
			name: "Anthony Zhang",
			url: "https://antxz.com",
		},
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `https://antxz.com/${locale}/blog?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};

	return (
		<main className="relative overflow-hidden">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-zinc-50 via-zinc-100 to-zinc-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
			<div
				className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
				style={{
					backgroundImage:
						"radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05) 1px,transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(34,197,94,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(96,165,250,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(134,239,172,0.12),transparent_50%)]" />

			<div className="relative z-10">
				<Hero />
				<Intro />
				<Blogs posts={posts ?? []} />
			</div>
		</main>
	);
}
