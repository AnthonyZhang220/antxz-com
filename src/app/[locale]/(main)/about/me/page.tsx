import Me from "@/components/about/me";

type MePageProps = {
	params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: MePageProps) {
	const { locale } = await params;
	return <Me locale={locale} />;
}
