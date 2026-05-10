import Image from "next/image";
import { PortableText } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/types";
import { getTranslations } from "next-intl/server";

import { createPortableTextComponents } from "@/components/shared/portable-text-components";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { aboutMeQuery } from "@/sanity/lib/queries";
import BlogComments from "@/components/blog/blog-comments";
import { Separator } from "@/components/ui/separator";

type AboutMeProps = {
	locale: string;
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

export default async function Me({ locale }: AboutMeProps) {
	const t = await getTranslations("blog");
	const tAbout = await getTranslations("about.me");
	const portableTextComponents = createPortableTextComponents({
		t,
		imageWidth: 1400,
	});

	const doc = await client.fetch<AboutMeDoc | null>(aboutMeQuery);

	const headline = localized(doc?.headline, locale) || tAbout("title");
	const tagline = localized(doc?.tagline, locale) || tAbout("subtitle");
	const body = localizedBody(doc?.body, locale);

	const coverSrc =
		doc?.profileImage?.url ||
		(doc?.profileImage?.asset?._ref
			? urlFor(doc.profileImage).width(1800).url()
			: null);

	return (
		<>
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

			<main className="relative mx-auto w-full max-w-6xl overflow-x-clip px-5 py-14 sm:px-8 lg:px-10">
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

				<section className="rounded-2xl border bg-card/50 px-6 py-8 sm:px-8 sm:py-10">
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

				{/* Comments Section */}
				<Separator className="mt-16" />
				<section className="mt-16">
					<BlogComments articleKey="about:me" />
				</section>
			</main>
		</>
	);
}

