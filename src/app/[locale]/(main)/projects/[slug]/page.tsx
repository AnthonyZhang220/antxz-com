import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { client } from "@/sanity/lib/client";
import { projectBySlugQuery } from "@/sanity/lib/queries";
import type { ProjectItem } from "@/lib/types/project";
import type { Metadata } from "next";
import { JsonLd } from "@/components/shared/json-ld";
import type { SoftwareApplication, WithContext } from "schema-dts";
import { cache } from "react";

interface ProjectDetailPageProps {
	params: Promise<{ locale: string; slug: string }>;
}

const getProject = cache(async (slug: string) =>
	client.fetch<ProjectItem | null>(projectBySlugQuery, { slug }),
);

export async function generateMetadata({
	params,
}: ProjectDetailPageProps): Promise<Metadata> {
	const { slug, locale } = await params;
	const project = await getProject(slug);
	if (!project) return {};

	const canonicalUrl = `https://antxz.com/${locale}/projects/${slug}`;

	return {
		title: project.title,
		description: project.subtitle ?? project.introduction,
		keywords: project.tags ?? [],
		alternates: {
			canonical: canonicalUrl,
			languages: {
				en: `https://antxz.com/en/projects/${slug}`,
				zh: `https://antxz.com/zh/projects/${slug}`,
			},
		},
		openGraph: {
			title: project.title,
			description: project.subtitle ?? project.introduction,
			type: "website",
			url: canonicalUrl,
			siteName: "ANTXZ",
			locale: locale === "zh" ? "zh_CN" : "en_US",
			images: project.coverImage?.url
				? [
						{
							url: project.coverImage.url,
							width: 1200,
							height: 630,
							alt: project.title,
						},
					]
				: [{ url: "https://antxz.com/og-image.png", width: 1200, height: 630 }],
		},
		twitter: {
			card: "summary_large_image",
			title: project.title,
			description: project.subtitle ?? project.introduction,
			images: project.coverImage?.url
				? [project.coverImage.url]
				: ["https://antxz.com/og-image.png"],
		},
	};
}

export default async function ProjectDetailPage({
	params,
}: ProjectDetailPageProps) {
	const { slug, locale } = await params;
	const project = await getProject(slug);

	if (!project) notFound();

	const jsonLd: WithContext<SoftwareApplication> = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: project.title,
		description: project.subtitle ?? project.introduction,
		url: project.websiteUrl ?? `https://antxz.com/${locale}/projects/${slug}`,
		image: project.coverImage?.url,
		keywords: project.tags?.join(", "),
		datePublished: project.publishedAt,
		author: {
			"@type": "Person",
			name: "Anthony Zhang",
			url: "https://antxz.com",
		},
		...(project.githubUrl && {
			codeRepository: project.githubUrl,
		}),
	};

	return (
		<>
			<JsonLd jsonLd={jsonLd} />
			<ProjectDetail project={project} />
		</>
	);
}
