"use client";

import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/types";
import { Calendar, ExternalLink, FileUser, Mail, QrCode } from "lucide-react";
import { createPortableTextComponents } from "@/components/shared/portable-text-components";
import { urlFor } from "@/sanity/lib/image";
import BlogComments from "@/components/blog/blog-comments";
import { Separator } from "@/components/ui/separator";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GitHubIcon } from "../shared/github-icon";
import WeChatIcon from "../shared/wechat-icon";
import { useTranslations } from "next-intl";

type AboutMeProps = {
	locale: string;
	doc: AboutMeDoc | null;
};

type LocalizedText = {
	en?: string;
	zh?: string;
};

type LocalizedBody = {
	en?: PortableTextBlock[];
	zh?: PortableTextBlock[];
};

type AboutMeDoc = {
	headline?: LocalizedText;
	tagline?: LocalizedText;
	body?: LocalizedBody;
	updatedAt?: string;
	profileImage?: {
		asset?: { _ref?: string };
		url?: string;
		alt?: string;
	};
};

function localized(field: LocalizedText | undefined, locale: string): string {
	if (!field) return "";
	return (locale === "zh" ? field.zh : field.en) ?? field.en ?? field.zh ?? "";
}

function localizedBody(
	field: LocalizedBody | undefined,
	locale: string,
): PortableTextBlock[] {
	if (!field) return [];
	const preferred = locale === "zh" ? field.zh : field.en;
	return preferred ?? field.en ?? field.zh ?? [];
}

export default function Me({ locale, doc}: AboutMeProps) {
	const t = useTranslations("blog");
	const tAbout = useTranslations("about.me");
	const wechatId = "Noobita220";
	const portableTextComponents = createPortableTextComponents({
		t,
		imageWidth: 1400,
	});

	const headline = localized(doc?.headline, locale) || tAbout("title");
	const body = localizedBody(doc?.body, locale);

	const coverSrc =
		doc?.profileImage?.url ||
		(doc?.profileImage?.asset?._ref
			? urlFor(doc.profileImage).width(1800).url()
			: null);

	return (
		<>
			{/* Last Updated */}
			{doc?.updatedAt && (
				<div className="flex items-center justify-center gap-2 border-b bg-blue-50 px-4 py-2 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
					<Calendar className="size-3.5 shrink-0" />
					<span>{tAbout("lastUpdated")}</span>
					<span className="font-mono">
						{new Date(doc.updatedAt).toLocaleDateString(locale, {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</span>
				</div>
			)}
			<div
				className="pointer-events-none fixed right-0 top-1/2 -translate-y-1/2 select-none"
				aria-hidden
			>
				<span
					className="block font-black leading-none text-zinc-900 opacity-[0.04] dark:text-white dark:opacity-[0.05]"
					style={{ fontSize: "28vw" }}
				>
					02
				</span>
			</div>

			<main className="relative mx-auto w-full max-w-6xl overflow-x-clip px-5 sm:px-8 lg:px-10">
				{coverSrc ? (
					<section className="mt-8 overflow-hidden rounded-2xl border bg-card/60">
						<div className="relative aspect-16/7 w-full">
							<Image
								src={coverSrc}
								alt={doc?.profileImage?.alt ?? headline}
								fill
								className="object-cover"
							/>
						</div>
					</section>
				) : null}

				<section className="rounded-2xl border bg-card/50 px-6 py-6 sm:px-8 sm:py-10">
					{body.length > 0 ? (
						<div className="prose prose-zinc max-w-none dark:prose-invert">
							<PortableText value={body} components={portableTextComponents} />
						</div>
					) : (
						<p className="text-base leading-8 text-muted-foreground">
							{locale === "zh"
								? tAbout("emptyStateZh")
								: tAbout("emptyStateEn")}
						</p>
					)}
				</section>
				{/* Contact Section */}
				<section className="mt-8">
					<div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-background to-muted/30 p-8 sm:p-10">
						{/* Decorative elements */}
						<div className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
						<div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent/5 blur-3xl" />

						<div className="relative z-10">
							<h2 className="text-2xl font-bold tracking-tight text-foreground">
								{tAbout("contactTitle")}
							</h2>
							<p className="mt-2 text-base text-muted-foreground max-w-2xl">
								{tAbout("contactDescription")}
							</p>
							<p className="mt-3 inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
								{tAbout("contactIntentHint")}
							</p>

							{/* Contact Links Grid */}
							<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
								<Link
									href="mailto:hi@antxz.com"
									className="group flex flex-col items-start gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md"
								>
									<div className="flex w-full items-start justify-between gap-3">
										<div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
											<Mail className="h-5 w-5 text-primary" />
										</div>
										<span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
											<Mail className="h-3.5 w-3.5" />
											{tAbout("contactActionEmail")}
										</span>
									</div>
									<div className="space-y-1">
										<p className="text-xs font-semibold text-muted-foreground">
											{tAbout("contactEmail")}
										</p>
										<p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
											hi@antxz.com
										</p>
										<p className="text-xs text-muted-foreground">
											{tAbout("contactEmailHint")}
										</p>
									</div>
								</Link>

								<Link
									href="https://github.com/AnthonyZhang220"
									target="_blank"
									rel="noopener noreferrer"
									className="group flex flex-col items-start gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md"
								>
									<div className="flex w-full items-start justify-between gap-3">
										<div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
											<GitHubIcon className="h-5 w-5 text-primary" />
										</div>
										<span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
											<ExternalLink className="h-3.5 w-3.5" />
											{tAbout("contactActionExternal")}
										</span>
									</div>
									<div className="space-y-1">
										<p className="text-xs font-semibold text-muted-foreground">
											{tAbout("contactGithub")}
										</p>
										<p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
											@AnthonyZhang220
										</p>
										<p className="text-xs text-muted-foreground">
											{tAbout("contactGithubHint")}
										</p>
									</div>
								</Link>

								<AlertDialog>
									<AlertDialogTrigger asChild>
										<button
											type="button"
											className="group flex flex-col items-start gap-4 rounded-xl border bg-card/50 p-4 text-left transition-all hover:border-primary/50 hover:bg-card hover:shadow-md"
										>
											<div className="flex w-full items-start justify-between gap-3">
												<div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
													<WeChatIcon className="h-5 w-5 text-primary" />
												</div>
												<span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
													<QrCode className="h-3.5 w-3.5" />
													{tAbout("contactActionQr")}
												</span>
											</div>
											<div className="space-y-1">
												<p className="text-xs font-semibold text-muted-foreground">
													{tAbout("contactWechat")}
												</p>
												<p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
													{wechatId}
												</p>
												<p className="text-xs text-muted-foreground">
													{tAbout("contactWechatHint")}
												</p>
											</div>
										</button>
									</AlertDialogTrigger>
									<AlertDialogContent size="sm">
										<AlertDialogHeader>
											<AlertDialogTitle>
												{tAbout("wechatDialogTitle")}
											</AlertDialogTitle>
											<AlertDialogDescription>
												{tAbout("wechatDialogDescription")}
											</AlertDialogDescription>
										</AlertDialogHeader>
										<div className="mx-auto w-full max-w-60 space-y-3">
											<Image
												alt="WeChat QR Code"
												width={240}
												height={240}
												src="/qr_code.png"
												className="aspect-square w-full rounded-2xl border border-border bg-white bg-center bg-cover bg-no-repeat p-3 shadow-sm"
											/>
											<div className="rounded-xl border bg-muted/40 px-3 py-2 text-center">
												<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
													{tAbout("contactWechat")}
												</p>
												<p className="mt-1 font-mono text-sm font-medium text-foreground">
													{wechatId}
												</p>
											</div>
											<p className="text-center text-xs text-muted-foreground">
												{tAbout("wechatDialogFootnote")}
											</p>
										</div>
										<div className="flex justify-center">
											<AlertDialogCancel>
												{tAbout("contactDialogClose")}
											</AlertDialogCancel>
										</div>
									</AlertDialogContent>
								</AlertDialog>
								<Link
									href="/about/cv"
									target="_blank"
									rel="noopener noreferrer"
									className="group flex flex-col items-start gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md"
								>
									<div className="flex w-full items-start justify-between gap-3">
										<div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
											<FileUser className="h-5 w-5 text-primary" />
										</div>
										<span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
											<ExternalLink className="h-3.5 w-3.5" />
											{tAbout("contactActionCV")}
										</span>
									</div>
									<div className="space-y-1">
										<p className="text-xs font-semibold text-muted-foreground">
											{tAbout("contactCV")}
										</p>
										<p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
											CV
										</p>
										<p className="text-xs text-muted-foreground">
											{tAbout("contactCVHint")}
										</p>
									</div>
								</Link>
							</div>
						</div>
					</div>
				</section>
				{/* Comments Section */}
				<Separator className="mt-16" />
				<section className="mt-16">
					<BlogComments articleKey="about:me" />
				</section>
			</main>
		</>
	);
}
