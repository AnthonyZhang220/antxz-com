import {
	Bell,
	LayoutDashboard,
	MessageCircleMore,
	MessageCircleQuestionMark,
	Search,
	Settings,
	type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
	titleKey: string;
	slug: string;
	url: string;
	icon: LucideIcon;
};

type DashboardNavigation = {
	navMain: DashboardNavItem[];
	navSecondary: DashboardNavItem[];
};

const dashboardNavDefinitions = {
	navMain: [
		{
			titleKey: "dashboard.navigation.overview",
			slug: "",
			icon: LayoutDashboard,
		},
		{
			titleKey: "dashboard.navigation.comments",
			slug: "comments",
			icon: MessageCircleMore,
		},
			{
				titleKey: "dashboard.navigation.notifications",
				slug: "notifications",
				icon: Bell,
			},
	],
	navSecondary: [
		{
			titleKey: "dashboard.navigation.settings",
			slug: "settings",
			icon: Settings,
		},
		{
			titleKey: "dashboard.navigation.help",
			slug: "help",
			icon: MessageCircleQuestionMark,
		},
		{
			titleKey: "dashboard.navigation.search",
			slug: "search",
			icon: Search,
		},
	],
} satisfies {
	navMain: Array<Omit<DashboardNavItem, "url"> & { titleKey: string }>;
	navSecondary: Array<Omit<DashboardNavItem, "url"> & { titleKey: string }>;
};

// Get nav items with labels for server-side use
export function getDashboardNavDefinitions() {
	return dashboardNavDefinitions;
}

// Map slug to titleKey for client-side title lookup
const slugToTitleKey: Record<string, string> = {
	"": dashboardNavDefinitions.navMain[0].titleKey,
	comments: dashboardNavDefinitions.navMain[1].titleKey,
	notifications: dashboardNavDefinitions.navMain[2].titleKey,
	settings: dashboardNavDefinitions.navSecondary[0].titleKey,
	help: dashboardNavDefinitions.navSecondary[1].titleKey,
	search: dashboardNavDefinitions.navSecondary[2].titleKey,
};

export function getDashboardTitleKey(segment: string | null): string {
	return (
		slugToTitleKey[segment || ""] || dashboardNavDefinitions.navMain[0].titleKey
	);
}

export function getDashboardNavigation(locale: string): DashboardNavigation {
	const baseUrl = `/${locale}/dashboard`;

	return {
		navMain: dashboardNavDefinitions.navMain.map((item) => ({
			titleKey: item.titleKey, // Keep titleKey for now, will be replaced by client
			slug: item.slug,
			icon: item.icon,
			url: item.slug ? `${baseUrl}/${item.slug}` : baseUrl,
		})),
		navSecondary: dashboardNavDefinitions.navSecondary.map((item) => ({
			titleKey: item.titleKey,
			slug: item.slug,
			icon: item.icon,
			url: item.slug ? `${baseUrl}/${item.slug}` : baseUrl,
		})),
	};
}

export function getDashboardTitle(segment: string | null): string {
	const titleKey = getDashboardTitleKey(segment);
	// Return titleKey for client-side translation
	return titleKey;
}
