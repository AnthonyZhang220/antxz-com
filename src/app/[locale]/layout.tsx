import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { NextIntlClientProvider } from "next-intl";

export default function LocaleLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<NextIntlClientProvider>
			<Navbar />
			{children}
			<Footer />
		</NextIntlClientProvider>
	);
}
