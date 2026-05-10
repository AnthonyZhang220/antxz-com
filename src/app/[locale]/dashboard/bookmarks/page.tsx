import DashboardBookmarks from "@/components/dashboard/bookmarks";

type DashboardBookmarksPageProps = {
	params: Promise<{ locale: string }>;
};

export default async function DashboardBookmarksPage({ params }: DashboardBookmarksPageProps) {
	const { locale } = await params;
	return <DashboardBookmarks locale={locale} />;
}
