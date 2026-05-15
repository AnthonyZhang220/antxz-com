import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { ensureUserSettingsFromCookies } from "@/lib/user/preferences-server";
import DashboardMobileNav from "@/components/dashboard/mobile-nav";

type DashboardLayoutProps = {
	children: ReactNode;
	params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({
	children,
	params,
}: DashboardLayoutProps) {
	const { locale } = await params;
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getClaims();

	if (error || !data?.claims) {
		redirect(`/${locale}/auth/login`);
	}

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		await ensureUserSettingsFromCookies(user.id);
	}

	return (
		<SidebarProvider
			className="h-svh overflow-hidden"
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<DashboardSidebar initialUser={user} variant="inset" />
			<SidebarInset>
				<DashboardHeader />
				<main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
				<DashboardMobileNav />
			</SidebarInset>
		</SidebarProvider>
	);
}
