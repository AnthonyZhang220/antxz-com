import Me from "@/components/about/me";
import { aboutMeQuery } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";

type MePageProps = {
	params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: MePageProps) {
	const { locale } = await params;
	const doc = await client.fetch(aboutMeQuery);
	return <Me locale={locale} doc={doc} />;
}
