import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ProjectDetail } from "@/components/projects/project-detail";
import { mapProjectLabels } from "@/lib/project-labels";
import { client } from "@/sanity/lib/client";
import { allProjectSlugsQuery, projectBySlugQuery } from "@/sanity/lib/queries";
import type { ProjectItem } from "@/types/project";

interface ProjectDetailPageProps {
	params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
	const slugs = await client.fetch<Array<{ slug: string }>>(allProjectSlugsQuery);
	return slugs.map(({ slug }) => ({ slug }));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
	const { locale, slug } = await params;
	const t = await getTranslations("project");
	const project = await client.fetch<ProjectItem | null>(projectBySlugQuery, { slug });

	if (!project) {
		notFound();
	}

	return <ProjectDetail project={project} locale={locale} labels={mapProjectLabels(t)} />;
}
