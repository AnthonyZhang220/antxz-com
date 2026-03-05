export default function PreferencesLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <section className="min-h-screen">{children}</section>;
}
