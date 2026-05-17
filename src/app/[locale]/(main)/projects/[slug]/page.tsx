import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { client } from "@/sanity/lib/client";
import { projectBySlugQuery } from "@/sanity/lib/queries";
import type { ProjectItem } from "@/lib/types/project";

interface ProjectDetailPageProps {
	params: Promise<{ locale: string; slug: string }>;
}

// export async function generateStaticParams() {
// 	const slugs =
// 		await client.fetch<Array<{ slug: string }>>(allProjectSlugsQuery);

// 	const locales = ["en", "zh"];

// 	return locales.flatMap((locale) =>
// 		slugs.map(({ slug }) => ({ slug, locale })),
// 	);
// }

export default async function ProjectDetailPage({
	params,
}: ProjectDetailPageProps) {
	const { slug } = await params;
	const project = await client.fetch<ProjectItem | null>(projectBySlugQuery, {
		slug,
	});

	if (!project) {
		notFound();
	}

	return <ProjectDetail project={project} />;
}
