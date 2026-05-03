import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { allPostSlugsQuery, allProjectSlugsQuery } from "@/sanity/lib/queries";

const BASE_URL = "https://antxz.com";
const locales = ["en", "zh"] as const;

type Locale = (typeof locales)[number];

function url(locale: Locale, path: string): string {
	return `${BASE_URL}/${locale}${path}`;
}

function staticEntry(
	path: string,
	options?: Partial<MetadataRoute.Sitemap[number]>,
): MetadataRoute.Sitemap[number][] {
	return locales.map((locale) => ({
		url: url(locale, path),
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: 0.8,
		...options,
	}));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Fetch dynamic slugs from Sanity
	const [postSlugs, projectSlugs] = await Promise.all([
		client.fetch(allPostSlugsQuery),
		client.fetch(allProjectSlugsQuery),
	]);

	// Static pages
	const staticPages: MetadataRoute.Sitemap = [
		// Home
		...locales.map((locale) => ({
			url: url(locale, ""),
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 1.0,
		})),
		// About
		...staticEntry("/about/me", { priority: 0.9 }),
		...staticEntry("/about/cv", { priority: 0.8 }),
		// Content listings
		...staticEntry("/blog", { changeFrequency: "weekly", priority: 0.9 }),
		...staticEntry("/projects", { changeFrequency: "monthly", priority: 0.9 }),
		// Other pages
		...staticEntry("/mbti", { priority: 0.6 }),
		...staticEntry("/preferences", { priority: 0.4 }),
	];

	// Dynamic blog posts
	const blogPages: MetadataRoute.Sitemap = (postSlugs ?? []).flatMap(
		({ slug }: { slug: string }) =>
			locales.map((locale) => ({
				url: url(locale, `/blog/${slug}`),
				lastModified: new Date(),
				changeFrequency: "weekly" as const,
				priority: 0.7,
			})),
	);

	// Dynamic project pages
	const projectPages: MetadataRoute.Sitemap = (projectSlugs ?? []).flatMap(
		({ slug }: { slug: string }) =>
			locales.map((locale) => ({
				url: url(locale, `/projects/${slug}`),
				lastModified: new Date(),
				changeFrequency: "monthly" as const,
				priority: 0.7,
			})),
	);

	return [...staticPages, ...blogPages, ...projectPages];
}
