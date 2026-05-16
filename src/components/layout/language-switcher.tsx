"use client";

import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { LucideIcon } from "lucide-react";

type LanguageItem = {
	code: string;
	label: string;
	icons?: LucideIcon;
};

const languageList: LanguageItem[] = [
	{ code: "en", label: "English" },
	{ code: "zh", label: "中文" },
];

export function AuthLanguageSwitcher() {
	const locale = useLocale();
	const pathname = usePathname();

	return (
		<div className="inline-flex items-center rounded-full border border-border/70 bg-muted/30 p-1 text-xs">
			{languageList.map((l) => (
				<button
					key={l.code}
					onClick={() => (window.location.href = `/${l.code}${pathname}`)}
					className={cn(
						"rounded-full px-2.5 py-1 font-medium transition-colors",
						locale === l.code
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					{l.code === "en" ? "English" : "中文"}
				</button>
			))}
		</div>
	);
}
