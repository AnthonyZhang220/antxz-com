import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { NotificationToastListener } from "@/components/providers/notification-toast-listener";

type LocaleLayoutProps = Readonly<{
	children: React.ReactNode;
}>;

export const dynamic = "force-dynamic"; // 强制动态渲染，确保每次请求都能获取最新的用户偏好设置和翻译文本

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
	return (
		<NextIntlClientProvider>
			<NotificationToastListener />
			{children}
		</NextIntlClientProvider>
	);
}
