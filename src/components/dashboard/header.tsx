"use client";

import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getDashboardTitleKey } from "@/lib/actions/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { GitHubIcon } from "@/components/shared/github-icon";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
	const segment = useSelectedLayoutSegment();
	const titleKey = getDashboardTitleKey(segment);
	const t = useTranslations();
	const title = t(titleKey);
	const pathname = usePathname();
	const isActive = pathname.endsWith("/dashboard/settings/");

	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-2 md:px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1 max-md:order-last max-md:ml-auto max-md:-mr-1 hidden md:flex" />
				<Button
					asChild
					variant="ghost"
					className={cn(
						"flex items-center gap-2 text-foreground max-md:order-last md:hidden",
						isActive && "text-accent-foreground",
					)}
				>
					<Link href="/dashboard/settings/">
						<Settings className="size-5" />
					</Link>
				</Button>
				<Separator
					orientation="vertical"
					className="mx-2 hidden data-[orientation=vertical]:h-4 md:block"
				/>
				<h1 className="absolute left-1/2 text-base font-medium -translate-x-1/2 md:static md:translate-x-0 md:left-auto">
					{title}
				</h1>
				<div className="ml-auto flex items-center gap-2">
					<Button
						variant="outline"
						asChild
						size="sm"
						className="hidden md:flex"
					>
						<Link
							href="https://github.com/AnthonyZhang220/antxz-com"
							rel="noopener noreferrer"
							target="_blank"
							className="flex items-center gap-2 text-foreground"
						>
							<GitHubIcon className="size-4 fill-current" />
							GitHub
						</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
