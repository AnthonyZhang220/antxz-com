import { getTranslations } from "next-intl/server";

export default async function AuthLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const tHome = await getTranslations("home");

	return (
		<main className="grid min-h-svh overflow-hidden lg:grid-cols-2">
			<section className="flex min-h-svh items-center justify-center p-6 md:p-10">
				<div className="w-full max-w-sm">{children}</div>
			</section>
			<aside className="relative hidden items-end bg-muted p-10 lg:flex">
				<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/15 via-muted to-muted" />
				<div className="relative space-y-3">
					<p className="font-montserrat text-sm uppercase tracking-[0.2em] text-muted-foreground">
						{tHome("logo")}
					</p>
					<p className="font-montserrat text-4xl font-semibold leading-tight text-foreground xl:text-5xl">
						{tHome("motto")}
					</p>
				</div>
			</aside>
		</main>
	);
}
