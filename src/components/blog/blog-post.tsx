"use client";

import Image from "next/image";
import Link from "next/link";
import { PortableText, PortableTextComponents } from "next-sanity";
import { useFormatter, useTranslations } from "next-intl";
import { urlFor } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

// ─── Portable Text Components ─────────────────────────────────────────────────
const ptComponents: PortableTextComponents = {
	types: {
		image: ({ value }) => {
			const src = value?.asset?._ref
				? urlFor(value).width(1200).url()
				: value?.url;
			if (!src) return null;
			return (
				<figure className="my-8">
					<div className="relative aspect-video w-full overflow-hidden rounded-xl">
						<Image
							src={src}
							alt={value?.caption ?? ""}
							fill
							className="object-cover"
						/>
					</div>
					{value?.caption && (
						<figcaption className="mt-2 text-center text-sm text-muted-foreground">
							{value.caption}
						</figcaption>
					)}
				</figure>
			);
		},
		code: ({ value }) => (
			<pre className="my-6 overflow-x-auto rounded-xl bg-zinc-900 p-5 text-sm text-zinc-100 dark:bg-zinc-950">
				<code>{value?.code}</code>
			</pre>
		),
	},
	block: {
		h1: ({ children }) => (
			<h1 className="mt-10 mb-4 font-serif text-4xl font-bold tracking-tight text-foreground">
				{children}
			</h1>
		),
		h2: ({ children }) => (
			<h2 className="mt-10 mb-4 font-serif text-3xl font-semibold tracking-tight text-foreground">
				{children}
			</h2>
		),
		h3: ({ children }) => (
			<h3 className="mt-8 mb-3 font-serif text-2xl font-semibold text-foreground">
				{children}
			</h3>
		),
		h4: ({ children }) => (
			<h4 className="mt-6 mb-2 text-xl font-semibold text-foreground">
				{children}
			</h4>
		),
		normal: ({ children }) => (
			<p className="my-5 leading-8 text-zinc-700 dark:text-zinc-300">
				{children}
			</p>
		),
		blockquote: ({ children }) => (
			<blockquote className="my-6 border-l-4 border-zinc-300 pl-5 italic text-muted-foreground dark:border-zinc-700">
				{children}
			</blockquote>
		),
	},
	list: {
		bullet: ({ children }) => (
			<ul className="my-5 ml-6 list-disc space-y-2 text-zinc-700 dark:text-zinc-300">
				{children}
			</ul>
		),
		number: ({ children }) => (
			<ol className="my-5 ml-6 list-decimal space-y-2 text-zinc-700 dark:text-zinc-300">
				{children}
			</ol>
		),
	},
	listItem: {
		bullet: ({ children }) => <li className="leading-7">{children}</li>,
		number: ({ children }) => <li className="leading-7">{children}</li>,
	},
	marks: {
		strong: ({ children }) => (
			<strong className="font-semibold text-foreground">{children}</strong>
		),
		em: ({ children }) => <em className="italic">{children}</em>,
		code: ({ children }) => (
			<code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
				{children}
			</code>
		),
		link: ({ children, value }) => (
			<a
				href={value?.href}
				target="_blank"
				rel="noopener noreferrer"
				className="underline decoration-zinc-400 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground"
			>
				{children}
			</a>
		),
	},
};

// ─── Main Component ───────────────────────────────────────────────────────────
interface BlogPostPageProps {
	post: {
		_id: string;
		slug: string;
		title: string;
		excerpt?: string;
		body?: unknown[];
		coverImage?: {
			asset?: { _ref: string };
			url?: string;
			alt?: string;
		};
		publishedAt: string;
		_updatedAt?: string;
		readingTime?: number;
		tags?: string[];
		category?: { _id: string; title: string; slug: string };
		author?: {
			_id: string;
			name: string;
			bio?: string;
			avatar?: { url?: string };
		};
	};
}

function estimateReadingTime(body: unknown[]): number {
	const text = body
		.filter((b: unknown) => (b as { _type: string })._type === "block")
		.flatMap(
			(b: unknown) =>
				(b as { children: { text: string }[] }).children?.map((c) => c.text) ??
				[],
		)
		.join(" ");
	return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

export default function BlogPostPage({ post }: BlogPostPageProps) {
	const t = useTranslations("blog");
	const fmt = useFormatter();
	const readingTime =
		post.readingTime ?? (post.body ? estimateReadingTime(post.body) : 1);
	const coverSrc =
		post.coverImage?.url ||
		(post.coverImage?.asset?._ref
			? urlFor(post.coverImage).width(1600).url()
			: null);

	return (
		<div className="min-h-screen bg-background">
			{/* ── Cover ── */}
			{coverSrc && (
				<div className="relative h-[30vh] w-full overflow-hidden sm:h-[38vh] lg:h-[44vh]">
					<Image
						src={coverSrc}
						alt={post.coverImage?.alt ?? post.title}
						fill
						priority
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
				</div>
			)}

			{/* ── Article ── */}
			<article className="mx-auto max-w-3xl px-5 sm:px-8">
				{/* Back button */}
				<div className={coverSrc ? "-mt-8 sm:-mt-10 relative z-10" : "pt-16"}>
					<Button
						variant="ghost"
						size="sm"
						asChild
						className="mb-6 -ml-2 text-muted-foreground backdrop-blur-sm hover:bg-background hover:text-foreground"
					>
						<Link href="/blog">
							<ArrowLeft className="mr-1.5 h-4 w-4" />
							{t("allPosts")}
						</Link>
					</Button>
				</div>

				{/* Tags */}
				{post.tags && post.tags.length > 0 && (
					<div className="mb-4 flex flex-wrap gap-2">
						{post.tags.map((tag) => (
							<Badge
								key={tag}
								variant="secondary"
								className="font-mono text-xs uppercase tracking-wider"
							>
								{tag}
							</Badge>
						))}
					</div>
				)}

				{/* Title */}
				<h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
					{post.title}
				</h1>

				{/* Excerpt */}
				{post.excerpt && (
					<p className="mt-4 text-lg leading-relaxed text-muted-foreground">
						{post.excerpt}
					</p>
				)}

				{/* Meta row */}
				<div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
					{post.author && (
						<span className="flex items-center gap-1.5">
							<User className="h-3.5 w-3.5" />
							{post.author.name}
						</span>
					)}
					<span className="flex items-center gap-1.5">
						<Calendar className="h-3.5 w-3.5" />
						{fmt.dateTime(new Date(post.publishedAt), {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</span>
					<span className="flex items-center gap-1.5">
						<Clock className="h-3.5 w-3.5" />
						{t("readingTime", { minutes: readingTime })}
					</span>
					{post.category && (
						<Badge variant="outline" className="font-mono text-xs">
							{post.category.title}
						</Badge>
					)}
				</div>

				<Separator className="my-8" />

				{/* Body */}
				{post.body && post.body.length > 0 ? (
					<div className="pb-8">
						<PortableText
							value={post.body as Parameters<typeof PortableText>[0]["value"]}
							components={ptComponents}
						/>
					</div>
				) : (
					<p className="pb-8 text-muted-foreground italic">
						{t("noContentYet")}
					</p>
				)}
			</article>
		</div>
	);
}
