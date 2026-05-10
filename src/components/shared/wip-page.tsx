import { Construction } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function WipPage({ titleKey }: { titleKey: string }) {
	const t = await getTranslations();

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
			<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/40">
				<Construction className="size-8 text-amber-600 dark:text-amber-400" />
			</div>
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">{t(titleKey)}</h1>
				<p className="max-w-sm text-sm text-muted-foreground">
					{t("wip.description")}
				</p>
			</div>
			<div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
				<Construction className="size-3" />
				{t("wip.badge")}
			</div>
		</div>
	);
}
