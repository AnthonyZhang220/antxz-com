import { Metadata } from "next";

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function PreferencesLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <section className="min-h-screen">{children}</section>;
}
