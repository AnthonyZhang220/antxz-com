"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { User } from "@supabase/supabase-js";

import { getDashboardNavigation } from "./navigation";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthNavigation, useUserState } from "@/hooks";
import { useSidebar } from "@/components/ui/sidebar";

type DashboardSidebarProps = React.ComponentProps<typeof Sidebar> & {
	initialUser?: User | null;
};

export function DashboardSidebar({
	initialUser,
	...props
}: DashboardSidebarProps) {
	const locale = useLocale();
	const t = useTranslations();
	const baseUrl = `/${locale}`;
	const rawNavigation = getDashboardNavigation(locale);
	const { isMobile } = useSidebar();
	const { user, displayName, isLoading, initials, signOut } =
		useUserState(initialUser);
	const { handleLogout } = useAuthNavigation(signOut);

	// Replace titleKey with actual translations
	const navigation = {
		navMain: rawNavigation.navMain.map((item) => ({
			...item,
			title: t(item.titleKey),
		})),
		navSecondary: rawNavigation.navSecondary.map((item) => ({
			...item,
			title: t(item.titleKey),
		})),
	};

	return (
		<Sidebar
			collapsible="offcanvas"
			side={isMobile ? "right" : "left"}
			{...props}
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5!"
						>
							<Link href={baseUrl}>
								<span className="text-base font-semibold">
									{t("dashboard.navigation.brand")}
								</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navigation.navMain} />
				<NavSecondary items={navigation.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={user}
					displayName={displayName}
					isLoading={isLoading}
					initials={initials}
					onLogout={handleLogout}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}
