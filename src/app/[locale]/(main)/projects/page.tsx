import type { Metadata } from "next";
import { ProjectsShowcase } from "@/components/projects/projects-showcase";
import { mapProjectLabels } from "@/lib/i18n/project-labels";
import { client } from "@/sanity/lib/client";
import { allProjectsQuery } from "@/sanity/lib/queries";
import type { ProjectItem } from "@/lib/types/project";
import enMessages from "@/messages/en.json";
import zhMessages from "@/messages/zh.json";

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
				locale === "zh" ? "我构建的项目" : "Projects and work I've built",
			url: canonicalUrl,
			siteName: "ANTXZ",
			locale: locale === "zh" ? "zh_CN" : "en_US",
		},
	};
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
	const { locale } = await params;
	const messages = locale === "zh" ? zhMessages : enMessages;

	const projectMessages = messages.project as Record<string, string>; // 按实际 JSON 结构调整路径

	const t = (key: string) => projectMessages[key] ?? key;

	const projects = await client.fetch<ProjectItem[]>(
		allProjectsQuery,
		{
			locale,
		},
		{
			next: {
				revalidate: 86400,
				tags: ["project"],
			},
		},
	);

	return (
		<ProjectsShowcase projects={projects ?? []} labels={mapProjectLabels(t)} />
	);
}
