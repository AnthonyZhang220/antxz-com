import { getTranslations } from "next-intl/server";

export interface ProjectLabels {
	title: string;
	subtitle: string;
	viewDetails: string;
	overview: string;
	keyFeatures: string;
	roles: string;
	libraries: string;
	process: string;
	challenges: string;
	results: string;
	screenshots: string;
	allProjects: string;
	details: string;
	liveSite: string;
	sourceCode: string;
	featured: string;
	new: string;
	emptyTitle: string;
	emptyDescription: string;
	openStudio: string;
}

export function mapProjectLabels(
	t: Awaited<ReturnType<typeof getTranslations>>,
): ProjectLabels {
	return {
		title: t("title"),
		subtitle: t("subtitle"),
		viewDetails: t("viewDetails"),
		overview: t("overview"),
		keyFeatures: t("keyFeatures"),
		roles: t("roles"),
		libraries: t("libraries"),
		process: t("process"),
		challenges: t("challenges"),
		results: t("results"),
		screenshots: t("screenshots"),
		allProjects: t("allProjects"),
		details: t("details"),
		liveSite: t("liveSite"),
		sourceCode: t("sourceCode"),
		featured: t("featured"),
		new: t("new"),
		emptyTitle: t("emptyTitle"),
		emptyDescription: t("emptyDescription"),
		openStudio: t("openStudio"),
	};
}
