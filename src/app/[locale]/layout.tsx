import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";

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

export default async function LocaleLayout({
	children,
}: LocaleLayoutProps) {
	return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
