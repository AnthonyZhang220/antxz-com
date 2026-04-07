import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

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

	return (
		<SidebarProvider
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
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
