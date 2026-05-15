"use client";

import Image from "next/image";
import { PortableText } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/types";
import { Calendar } from "lucide-react";
import { createPortableTextComponents } from "@/components/shared/portable-text-components";
import { urlFor } from "@/sanity/lib/image";

import { useTranslations } from "next-intl";
import MeContact from "./me-contact";

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

export default function Me({ locale, doc }: AboutMeProps) {
	const t = useTranslations("blog");
	const tAbout = useTranslations("about.me");
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
				<MeContact />
			</main>
		</>
	);
}
