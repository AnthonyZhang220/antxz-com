export type FooterNavLabels = {
	home: string;
	about: string;
	projects: string;
	blog: string;
	mbti: string;
	dashboard: string;
	auth: string;
	nextjs: string;
	protected: string;
};

type FooterNavTranslationKey =
	| "nav.home"
	| "nav.about"
	| "nav.projects"
	| "nav.blog"
	| "nav.mbti"
	| "nav.dashboard"
	| "nav.auth"
	| "nav.nextjs"
	| "nav.protected";

type FooterTranslator = (key: FooterNavTranslationKey) => string;

export type FooterNavContext = {
	showContextNav: boolean;
	breadcrumbItems: {
		label: string;
		href?: string;
	}[];
};

export function getFooterNavLabels(t: FooterTranslator): FooterNavLabels {
	return {
		home: t("nav.home"),
		about: t("nav.about"),
		projects: t("nav.projects"),
		blog: t("nav.blog"),
		mbti: t("nav.mbti"),
		dashboard: t("nav.dashboard"),
		auth: t("nav.auth"),
		nextjs: t("nav.nextjs"),
		protected: t("nav.protected"),
	};
}

export function buildFooterNavContext(
	pathname: string,
	labels: FooterNavLabels,
): FooterNavContext {
	const pathSegments = pathname.split("/").filter(Boolean);
	const locale = pathSegments[0] ?? "en";
	const contentSegments = pathSegments.slice(1);
	const homePath = `/${locale}`;

    // 定义每个路径段对应的标签
	const sectionLabelMap: Record<string, string> = {
		about: labels.about,
		projects: labels.projects,
		blog: labels.blog,
		mbti: labels.mbti,
		dashboard: labels.dashboard,
		auth: labels.auth,
		nextjs: labels.nextjs,
		protected: labels.protected,
	};

    // 构建面包屑导航的路径和标签
	const locationTrail =
		contentSegments.map((segment) => sectionLabelMap[segment] ?? segment);

    // 构建面包屑导航
	const breadcrumbItems = [
		{ label: labels.home, href: homePath },
		...locationTrail.map((label, index) => {
			const isLast = index === locationTrail.length - 1;
			const href = isLast
				? undefined
				: `/${locale}/${contentSegments.slice(0, index + 1).join("/")}`;

			return {
				label,
				href,
			};
		}),
	];

	return {
		showContextNav: contentSegments.length > 0,
		breadcrumbItems,
	};
}