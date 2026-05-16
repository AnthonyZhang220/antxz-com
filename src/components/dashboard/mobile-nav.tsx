"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getDashboardNavigation } from "@/lib/actions/navigation";

export default function DashboardMobileNav() {
	const t = useTranslations();
	const rawNav = getDashboardNavigation();
	const pathname = usePathname();

	const rawMobileNav = {
		navMobile: rawNav.navMobile.map((item) => ({
			...item,
			title: t(item.titleKey),
		})),
	};

	return (
		<nav className="fixed bottom-0 left-0 right-0 border-t bg-background/90 backdrop-blur md:hidden">
			<div className="flex h-15 items-center justify-around">
				{rawMobileNav.navMobile.map((item) => {
					const normalizedPath = pathname.replace(/\/$/, "");
					const isOverview = item.url === `/dashboard`;

					const isActive = isOverview
						? normalizedPath === item.url
						: normalizedPath.startsWith(item.url);
					return (
						<Link
							key={item.url}
							href={item.url}
							className={cn(
								"relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 w-16 rounded-4xl text-sm transition-colors",
								isActive ? "text-foreground" : "text-muted-foreground",
							)}
						>
							{/* 动画背景/圆点 */}
							{isActive && (
								<motion.div
									layoutId="activeTab"
									className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-foreground"
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
