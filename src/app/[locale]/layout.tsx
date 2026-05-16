import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotificationToastListener } from "@/lib/providers/notification-toast-listener";
import { PreferencesProvider } from "@/lib/providers/preference-provider";
import { resolveUserPreferences } from "@/lib/user/preferences-actions";

type LocaleLayoutProps = Readonly<{
	children: React.ReactNode;
}>;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "metadata" });

	return {
		title: t("title"),
		description: t("description"),
		openGraph: {
			title: t("title"),
			description: t("description"),
			type: "website",
			siteName: "AntXZ",
			locale: locale === "zh" ? "zh_CN" : "en_US",
		},
		twitter: {
			card: "summary",
			title: t("title"),
			description: t("description"),
		},
	};
}

export default async function LocaleLayout({ children }: LocaleLayoutProps) {
	const result = await resolveUserPreferences();

	const serverSettings = result.success ? result.data : null;
	const preferenceSettings = {
		locale: serverSettings?.locale ?? "en",
		region: serverSettings?.region ?? "global",
		theme: serverSettings?.theme ?? "system",
		notifications_enabled: serverSettings?.notifications_enabled ?? true,
	};

	return (
		<PreferencesProvider initials={preferenceSettings}>
			<NotificationToastListener />
			{children}
		</PreferencesProvider>
	);
}
