"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useTranslations } from "next-intl";

import { getDashboardTitleKey } from "./navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { GitHubIcon } from "@/components/shared/github-icon";


export function DashboardHeader() {
	const segment = useSelectedLayoutSegment();
	const titleKey = getDashboardTitleKey(segment);
	const t = useTranslations();
	const title = t(titleKey);

	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1 max-md:order-last max-md:ml-auto max-md:-mr-1" />
				<Separator
					orientation="vertical"
					className="mx-2 hidden data-[orientation=vertical]:h-4 md:block"
				/>
				<h1 className="text-base font-medium">{title}</h1>
				<div className="ml-auto flex items-center gap-2">
					<Button variant="outline" asChild size="sm" className="hidden sm:flex">
						<a
							href="https://github.com/AnthonyZhang220/antxz-com"
							rel="noopener noreferrer"
							target="_blank"
							className="flex items-center gap-2 text-foreground"
						>
							<GitHubIcon className="size-4 fill-current" />
							GitHub
						</a>
					</Button>
				</div>
			</div>
		</header>
	);
}
