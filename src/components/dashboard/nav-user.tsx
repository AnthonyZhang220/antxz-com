"use client";

import { EllipsisVertical, LogOut, Bell, User } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UseAuthUserResult } from "@/hooks/useAuthUser";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

type NavUserProps = {
	user: UseAuthUserResult["user"];
	displayName: string;
	initials: string;
	isLoading?: boolean;
	onLogout?: () => Promise<void> | void;
};

export function NavUser({
	user,
	displayName,
	initials,
	isLoading = false,
	onLogout,
}: NavUserProps) {
	const { isMobile } = useSidebar();
	const locale = useLocale();
	const t = useTranslations("navbar.userMenu");

	if (!user || isLoading) {
		return null;
	}

	const avatarUrl =
		(user.user_metadata?.avatar_url as string | undefined) ||
		(user.user_metadata?.picture as string | undefined) ||
		"";
	const email = user.email ?? "";
	const hasAvatar = Boolean(avatarUrl);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg grayscale">
								<AvatarImage src={avatarUrl} alt={displayName} />
								<AvatarFallback className="rounded-lg bg-zinc-200 dark:bg-zinc-800">
									{hasAvatar ? null : initials}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{displayName}</span>
								<span className="truncate text-xs text-muted-foreground">
									{email}
								</span>
							</div>
							<EllipsisVertical className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={avatarUrl} alt={displayName} />
									<AvatarFallback className="rounded-lg bg-zinc-200 dark:bg-zinc-800">
										{hasAvatar ? null : initials}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{displayName}</span>
									<span className="truncate text-xs text-muted-foreground">
										{email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link href={`/${locale}/dashboard/account`}>
									<User />
									{t("account")}
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href={`/${locale}/dashboard/notifications`}>
									<Bell />
									{t("notifications")}
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={onLogout}>
							<LogOut />
							{t("logout")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
