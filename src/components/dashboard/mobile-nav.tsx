"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getDashboardNavigation } from "@/lib/actions/navigation";

export default function DashboardMobileNav() {
	const locale = useLocale();
	const t = useTranslations();
	const rawNav = getDashboardNavigation(locale);
	const pathname = usePathname();

	const rawMobileNav = {
		navMobile: rawNav.navMobile.map((item) => ({
			...item,
			title: t(item.titleKey),
		})),
	};

	return (
		<nav className="fixed bottom-0 left-0 right-0 border-t bg-background/90 backdrop-blur md:hidden">
			<div className="flex h-13 items-center justify-around">
				{rawMobileNav.navMobile.map((item) => {
					const normalizedPath = pathname.replace(/\/$/, "");
					const isOverview = item.url === `/${locale}/dashboard`;

					const isActive = isOverview
						? normalizedPath === item.url
						: normalizedPath.startsWith(item.url);
					return (
						<Link
							key={item.url}
							href={item.url}
							className={`flex flex-col items-center justify-center text-sm ${isActive ? "text-foreground" : "text-muted-foreground"}`}
						>
							{/* 动画背景/圆点 */}
							{isActive && (
								<motion.div
									layoutId="activeTab"
									className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 -z-10"
									transition={{ type: "spring", stiffness: 500, damping: 30 }}
								/>
							)}
							<item.icon
								className={cn(
									"h-6 w-6",
									isActive ? " text-foreground" : "text-muted-foreground",
								)}
							/>
							<span
								className={cn(
									"text-[10px]",
									isActive ? "text-foreground" : "text-muted-foreground",
								)}
							>
								{item.title}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
