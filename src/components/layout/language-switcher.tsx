"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";

function withLocale(pathname: string, nextLocale: "en" | "zh") {
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 0) return `/${nextLocale}`;

	if (segments[0] === "en" || segments[0] === "zh") {
		segments[0] = nextLocale;
		return `/${segments.join("/")}`;
	}

	return `/${nextLocale}/${segments.join("/")}`;
}

export function AuthLanguageSwitcher() {
	const locale = useLocale() as "en" | "zh";
	const pathname = usePathname();

	const targets = useMemo(
		() => ({
			en: withLocale(pathname, "en"),
			zh: withLocale(pathname, "zh"),
		}),
		[pathname],
	);

	return (
		<div className="inline-flex items-center rounded-full border border-border/70 bg-muted/30 p-1 text-xs">
			<Link
				href={targets.en}
				className={cn(
					"rounded-full px-2.5 py-1 font-medium transition-colors",
					locale === "en"
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground",
				)}
			>
				English
			</Link>
			<Link
				href={targets.zh}
				className={cn(
					"rounded-full px-2.5 py-1 font-medium transition-colors",
					locale === "zh"
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground",
				)}
			>
				中文
			</Link>
		</div>
	);
}
