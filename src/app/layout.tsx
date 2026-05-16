import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { ToasterProvider } from "@/lib/providers/toaster-provider";
import { SystemEasterEgg } from "@/components/shared/system-easter-egg";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAppTheme } from "@/lib/user/preferences";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const montserrat = Montserrat({
	variable: "--font-montserrat",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "AntXZ - Personal Platform",
	description:
		"A personal platform showcasing projects, thoughts, and experiences.",
	icons: {
		icon: "/favicon.svg",
		shortcut: "/favicon.svg",
		apple: "/favicon.svg",
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const preferredTheme = cookieStore.get("preferred_theme")?.value;
	const defaultTheme = isAppTheme(preferredTheme) ? preferredTheme : "system";
	const locale = await getLocale();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}
			>
				<NextIntlClientProvider>
					<SystemEasterEgg />
					<ThemeProvider
						attribute="class"
						defaultTheme={defaultTheme}
						enableSystem
						disableTransitionOnChange
					>
						<NextTopLoader
							color="linear-gradient(to right, #3b82f6, #a855f7)"
							height={2}
							showSpinner={false}
							shadow={false}
						/>
						<TooltipProvider>{children}</TooltipProvider>
						<ToasterProvider />
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
