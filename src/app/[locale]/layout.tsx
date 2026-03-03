import { HearMeCard } from "@/components/shared/hear-me";
import { NextIntlClientProvider } from "next-intl";

export default function LocaleLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<NextIntlClientProvider>
			{children}
			<HearMeCard />
		</NextIntlClientProvider>
	);
}
