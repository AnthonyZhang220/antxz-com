import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ProjectsShowcase } from "@/components/projects/projects-showcase";
import { mapProjectLabels } from "@/lib/i18n/project-labels";
import { client } from "@/sanity/lib/client";
import { allProjectsQuery } from "@/sanity/lib/queries";
import type { ProjectItem } from "@/lib/types/project";

interface ProjectsPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({
	params,
}: ProjectsPageProps): Promise<Metadata> {
	const { locale } = await params;
	const canonicalUrl = `https://antxz.com/${locale}/projects`;

	return {
		title: locale === "zh" ? "项目" : "Projects",
		description:
			locale === "zh" ? "我构建的项目" : "Projects and work I've built",
		alternates: {
			canonical: canonicalUrl,
			languages: {
				en: "https://antxz.com/en/projects",
				zh: "https://antxz.com/zh/projects",
			},
		},
		openGraph: {
			title: locale === "zh" ? "项目 | ANTXZ" : "Projects | ANTXZ",
			description:
				locale === "zh"
					? "我构建的项目"
					: "Projects and work I've built",
			url: canonicalUrl,
			siteName: "ANTXZ",
			locale: locale === "zh" ? "zh_CN" : "en_US",
		},
	};
}

export default async function ProjectsPage() {
	const t = await getTranslations("project");
	const projects = await client.fetch<ProjectItem[]>(allProjectsQuery);

	return (
		<ProjectsShowcase projects={projects ?? []} labels={mapProjectLabels(t)} />
	);
}
