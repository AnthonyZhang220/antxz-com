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
import {
	buildFooterNavContext,
	getFooterNavLabels,
} from "./footer-nav-context";
import { Button } from "../ui/button";
import ThemeModeButton from "./theme-mode-button";
import GlobeButton from "./globe-button";
import { GitHubIcon } from "./github-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const socialLinks = [
	{
		renderIcon: () => <Mail className="h-4 w-4" />,
		href: "mailto:hi@antxz.com",
		label: "Email",
	},
	{
		renderIcon: () => <GitHubIcon className="h-4 w-4 fill-current" />,
		href: "https://github.com/AnthonyZhang220",
		label: "GitHub",
	},
];

export default function Footer() {
	const t = useTranslations("footer");
	const pathname = usePathname();
	const year = new Date().getFullYear();

	const quickLinks = [
		{ href: "/", label: t("nav.home") },
		{ href: "/about/me", label: t("nav.me") },
		{ href: "/about/cv", label: t("nav.cv") },
		{ href: "/projects", label: t("projects") },
		{ href: "/blog", label: t("blog") },
		{ href: "/mbti", label: t("mbti") },
	];

	const techLinks = [
		{ label: "Next.js", href: "https://nextjs.org" },
		{ label: "Sanity", href: "https://www.sanity.io" },
		{ label: "Supabase", href: "https://supabase.com" },
		{ label: "shadcn/ui", href: "https://ui.shadcn.com" },
	];

	const { showContextNav, breadcrumbItems } = buildFooterNavContext(
		pathname,
		getFooterNavLabels(t),
	);

	return (
		<footer className="mt-auto bg-white px-4 py-8 pt-16 dark:bg-black sm:px-6 sm:py-10 sm:pt-20 lg:px-10 lg:py-12 lg:pt-24">
			{showContextNav && (
				<div className="mr-auto max-w-4xl px-2 py-2 text-xs text-zinc-500 dark:text-zinc-400 sm:px-4 sm:py-3">
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
			<div className="w-full px-2 py-5 sm:px-4 sm:py-6">
				<div className="grid gap-6 pb-8 md:grid-cols-3 md:items-start md:gap-6 md:pb-10">
					<div className="space-y-1">
						<p className="font-mono text-sm text-zinc-600 dark:text-zinc-300">
							{t("name")}
							<span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" />
						</p>
						<p className="text-xs text-zinc-500 dark:text-zinc-400">{t("tagline")}</p>
					</div>

					<div className="space-y-2 md:text-center">
						<p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
							{t("sections.navigate")}
						</p>
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-600 md:justify-center dark:text-zinc-300">
							{quickLinks.map((item, index) => (
								<Fragment key={item.href}>
									<Link
										href={item.href}
										className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
									>
										{item.label}
									</Link>
									{index < quickLinks.length - 1 && (
										<span className="text-zinc-400/80">/</span>
									)}
								</Fragment>
							))}
						</div>
					</div>

					<div className="space-y-2 md:text-right">
						<p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
							{t("sections.preferencesContact")}
						</p>
						<div className="flex flex-wrap items-center gap-1.5 md:justify-end">
							<GlobeButton />
							<ThemeModeButton />
							{socialLinks.map(({ renderIcon, href, label }) => (
								<Tooltip key={label}>
									<TooltipTrigger asChild>
										<Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0">
											<a
												href={href}
												target="_blank"
												rel="noopener noreferrer"
												aria-label={label}
											>
												{renderIcon()}
											</a>
										</Button>
									</TooltipTrigger>
									<TooltipContent>{label}</TooltipContent>
								</Tooltip>
							))}
						</div>
					</div>
				</div>

				<Separator className="my-0" />

				<div className="flex flex-col gap-1 pt-3 text-[11px] text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
					<span className="font-mono">© 2022 - {year} {t("name")}. {t("rights")}</span>
					<span className="font-mono">
						{t("builtWith")}{" "}
						{techLinks.map((tech, index) => (
							<Fragment key={tech.label}>
								<a
									href={tech.href}
									target="_blank"
									rel="noopener noreferrer"
									className="underline-offset-2 transition-colors hover:text-zinc-800 hover:underline dark:hover:text-zinc-200"
								>
									{tech.label}
								</a>
								{index < techLinks.length - 1 && <span>{" + "}</span>}
							</Fragment>
						))}
					</span>
				</div>
			</div>
		</footer>
	);
}
