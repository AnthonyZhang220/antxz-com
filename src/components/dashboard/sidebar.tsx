"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
import { createClient } from "@/lib/supabase/client";

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
	const supabase = useMemo(() => createClient(), []);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		if (!user?.id) return;
		let disposed = false;

		const loadUnread = async () => {
			const { count } = await supabase
				.from("notifications")
				.select("id", { count: "exact", head: true })
				.eq("user_id", user.id)
				.eq("is_read", false);
			if (!disposed) setUnreadCount(count ?? 0);
		};

		void loadUnread();

		const channel = supabase
			.channel(`sidebar-notifications-${user.id}`)
			.on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => { void loadUnread(); })
			.subscribe();

		return () => {
			disposed = true;
			void supabase.removeChannel(channel);
		};
	}, [supabase, user?.id]);

	// Replace titleKey with actual translations
	const navigation = {
		navMain: rawNavigation.navMain.map((item) => ({
			...item,
			title: t(item.titleKey),
			...(item.slug === "notifications" ? { badge: unreadCount } : {}),
		})),
		navSecondary: rawNavigation.navSecondary.map((item) => ({
			...item,
			title: t(item.titleKey),
		})),
	};

	return (
		<Sidebar
			collapsible="icon"
			side={isMobile ? "right" : "left"}
			style={
				{
					"--sidebar-width-icon": "4rem",
				} as React.CSSProperties
			}
			{...props}
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5!"
						>
							<Link href={baseUrl} aria-label={t("dashboard.navigation.brand")}>
								<Image
									src="/logo.svg"
									alt={t("dashboard.navigation.brand")}
									width={1024}
									height={672}
									className="h-8 w-auto shrink-0 object-contain dark:invert group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:scale-[1.35]"
								/>
								<span className="text-base font-semibold group-data-[collapsible=icon]:hidden">AntXZ.com</span>
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
