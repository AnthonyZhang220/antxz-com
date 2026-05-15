"use client";

import { EllipsisVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UseAuthUserResult } from "@/hooks/useAuthUser";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type NavUserProps = {
	user: UseAuthUserResult["user"];
	displayName: string;
	initials: string;
	isLoading?: boolean;
};

export default function NavUser({
	user,
	displayName,
	initials,
	isLoading = false,
}: NavUserProps) {
	const pathname = usePathname();
	const router = useRouter();
	const handleGoToAccount = () => {
		router.push("/dashboard/account/");
	};

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
				<SidebarMenuButton
					size="lg"
					className={cn(
						"data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
					)}
					isActive={pathname.endsWith("/dashboard/account/")}
					onClick={handleGoToAccount}
				>
					<Avatar className="h-8 w-8">
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
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
