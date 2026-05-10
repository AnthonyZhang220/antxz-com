import { redirect } from "next/navigation";

type OverviewPageProps = {
	params: Promise<{ locale: string }>;
};

export default async function OverviewPage({ params }: OverviewPageProps) {
	const { locale } = await params;
	redirect(`/${locale}/dashboard`);
}
