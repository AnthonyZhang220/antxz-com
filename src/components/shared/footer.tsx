"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
	buildFooterNavContext,
	getFooterNavLabels,
} from "./footer-nav-context";
import ThemeModeButton from "./theme-mode-button";
import GlobeButton from "./globe-button";

const socialLinks = [
	{ icon: Mail, href: "mailto:you@example.com", label: "Email" },
];

export default function Footer() {
	const t = useTranslations("footer");
	const pathname = usePathname();
	const year = new Date().getFullYear();

	const { showContextNav, breadcrumbItems } = buildFooterNavContext(
		pathname,
		getFooterNavLabels(t),
	);

	return (
		<footer className="mt-auto bg-white px-4 py-8 dark:bg-black sm:px-6 sm:py-10 lg:px-10 lg:py-12">
			{showContextNav && (
				<div className="mx-auto max-w-4xl px-2 py-2 text-xs text-zinc-500 dark:text-zinc-400 sm:px-4 sm:py-3">
					<Breadcrumb>
						<BreadcrumbList className="text-xs text-zinc-500 dark:text-zinc-400">
							{breadcrumbItems.map((item, index) => (
								<Fragment key={`${item.label}-${index}`}>
									<BreadcrumbItem>
										{item.href ? (
											<BreadcrumbLink asChild>
												<Link href={item.href}>{item.label}</Link>
											</BreadcrumbLink>
										) : (
											<BreadcrumbPage className="text-zinc-800 dark:text-zinc-100">
												{item.label}
											</BreadcrumbPage>
										)}
									</BreadcrumbItem>
									{index < breadcrumbItems.length - 1 && (
										<BreadcrumbSeparator />
									)}
								</Fragment>
							))}
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			)}
			<Separator />
			<div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-4 px-2 py-5 sm:flex-row sm:items-center sm:px-4 sm:py-6">
				{/* Left — Name */}
				<span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
					{t("name")}
					<span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" />
				</span>

				{/* Right — Socials + copyright */}
				<div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:gap-4">
					<GlobeButton />
					<ThemeModeButton />
					{socialLinks.map(({ icon: Icon, href, label }) => (
						<a
							key={label}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={label}
							className={cn(
								"text-zinc-400 dark:text-zinc-500",
								"hover:text-zinc-900 dark:hover:text-zinc-100",
								"transition-colors duration-150",
							)}
						>
							<Icon className="h-4 w-4" />
						</a>
					))}

					<Separator orientation="vertical" className="h-4" />

					<span className="font-mono text-[11px] text-zinc-300 dark:text-zinc-700">
						© {year}
					</span>
				</div>
			</div>
		</footer>
	);
}
