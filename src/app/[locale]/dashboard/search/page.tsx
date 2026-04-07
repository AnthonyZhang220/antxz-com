import { useTranslations } from "next-intl";

export default function DashboardSearchPage() {
	const t = useTranslations();

	return (
		<div className="p-4 lg:p-6">
			<h1 className="text-xl font-semibold">
				{t("dashboard.search.title")}
			</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				{t("dashboard.search.description")}
			</p>
		</div>
	);
}
