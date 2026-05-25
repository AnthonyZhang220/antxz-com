import { Metadata } from "next";
import CV from "@/components/about/cv";

// about/cv/page.tsx
export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const canonicalUrl = `https://antxz.com/${locale}/about/cv`;
	return {
		title: locale === "zh" ? "简历" : "CV",
		description:
			locale === "zh" ? "我的简历与经历" : "My resume and experience",
		alternates: {
			canonical: canonicalUrl,
			languages: {
				en: "https://antxz.com/en/about/cv",
				zh: "https://antxz.com/zh/about/cv",
			},
		},
	};
}

export default function Page() {
	return <CV />;
}
