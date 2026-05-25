import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotificationToastListener } from "@/lib/providers/notification-toast-listener";

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
		title: {
			default: t("title"),
			template: `%s | ANTXZ`,
			absolute: t("title"),
		},
		description: t("description"),
		keywords:
			locale === "zh"
				? ["个人博客", "技术博客", "项目展示", "前端开发", "全栈开发"]
				: ["personal blog", "tech blog", "projects", "frontend", "fullstack"],
		authors: [{ name: "Anthony Zhang", url: "https://antxz.com" }],
		creator: "Anthony Zhang",
		icons: {
			icon: "/favicon.svg",
			shortcut: "/favicon.svg",
			apple: "/apple-icon.png",
		},
		alternates: {
			canonical: `https://antxz.com/${locale}`,
		},
		openGraph: {
			title: t("title"),
			description: t("description"),
			type: "website",
			url: `https://antxz.com/${locale}`,
			siteName: "ANTXZ",
			locale: locale === "zh" ? "zh_CN" : "en_US",
			images: [
				{
					url: "https://antxz.com/og-image.png", // 1200x630
					width: 1200,
					height: 630,
					alt: t("title"),
				},
			],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}

export default async function LocaleLayout({ children }: LocaleLayoutProps) {
	return (
		<>
			<NotificationToastListener />
			{children}
		</>
	);
}
