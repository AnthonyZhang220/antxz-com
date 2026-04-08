import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { isAppTheme } from "@/lib/user-preferences";
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
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const preferredTheme = cookieStore.get("preferred_theme")?.value;
	const defaultTheme = isAppTheme(preferredTheme)
		? preferredTheme
		: "system";

	return (
		<html suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}
			>
				<ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
