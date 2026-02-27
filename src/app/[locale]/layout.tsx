import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
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
