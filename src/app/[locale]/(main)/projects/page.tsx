import { getTranslations } from "next-intl/server";

import { ProjectsShowcase } from "@/components/projects/projects-showcase";
import { mapProjectLabels } from "@/lib/i18n/project-labels";
import { client } from "@/sanity/lib/client";
import { allProjectsQuery } from "@/sanity/lib/queries";
import type { ProjectItem } from "@/lib/types/project";

interface ProjectsPageProps {
	params: Promise<{ locale: string }>;
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
	const { locale } = await params;
	const t = await getTranslations("project");
	const projects = await client.fetch<ProjectItem[]>(allProjectsQuery);

	return (
		<ProjectsShowcase
			projects={projects ?? []}
			locale={locale}
			labels={mapProjectLabels(t)}
		/>
	);
}
