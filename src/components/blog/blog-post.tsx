"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PortableText, PortableTextComponents } from "next-sanity";
import { useFormatter, useTranslations } from "next-intl";
import { urlFor } from "@/sanity/lib/image";
import { getActionErrorMessage } from "@/lib/errors/action-error";
import {
	getArticleLikeState,
	likeArticle,
	unlikeArticle,
} from "@/lib/actions/blog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
	ArrowLeft,
	Calendar,
	Clock,
	ExternalLink,
	Heart,
	MessageCircle,
	User,
} from "lucide-react";

interface HeadingItem {
	id: string;
	text: string;
	level: 2 | 3 | 4;
}

interface PortableTextBlock {
	_type?: string;
	_key?: string;
	style?: string;
	children?: Array<{ _type?: string; text?: string }>;
}

function getHeadingIdFromBlock(block: PortableTextBlock): string {
	if (typeof block._key === "string" && block._key.trim().length > 0) {
		return `heading-${block._key}`;
	}

	const text = extractBlockText(block);
	return `heading-${slugifyHeading(text) || "section"}`;
}

function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function extractBlockText(block: PortableTextBlock): string {
	return (block.children ?? [])
		.filter(
			(child) => child?._type === "span" && typeof child.text === "string",
		)
		.map((child) => child.text)
		.join("")
		.trim();
}

function extractHeadingItems(body?: unknown[]): HeadingItem[] {
	if (!Array.isArray(body)) return [];

	const idCounts = new Map<string, number>();
	const results: HeadingItem[] = [];

	for (const raw of body) {
		const block = raw as PortableTextBlock;
		if (block?._type !== "block") continue;
		if (block.style !== "h2" && block.style !== "h3" && block.style !== "h4")
			continue;

		const text = extractBlockText(block);
		if (!text) continue;

		const base = slugifyHeading(text) || "section";
		const seen = idCounts.get(base) ?? 0;
		idCounts.set(base, seen + 1);
		const rawId = getHeadingIdFromBlock(block);
		const id = seen === 0 ? rawId : `${rawId}-${seen + 1}`;

		results.push({
			id,
			text,
			level: Number(block.style.slice(1)) as 2 | 3 | 4,
		});
	}

	return results;
}

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
		commentCount?: number;
		likeCount?: number;
		source?: {
			platform?: string;
			originalUrl?: string;
		};
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

export default function BlogPostPage({ post }: BlogPostPageProps) {
	const t = useTranslations("blog");
	const fmt = useFormatter();
	const articleKey = useMemo(() => `blog:${post.slug}`, [post.slug]);
	const headingItems = useMemo(
		() => extractHeadingItems(post.body),
		[post.body],
	);
	const hasToc = headingItems.length > 0;
	const readingTime = post.readingTime ?? 1;
	const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
	const [userLiked, setUserLiked] = useState(false);
	const [isLiking, setIsLiking] = useState(false);
	const [likeError, setLikeError] = useState<string | null>(null);
	const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

	const sourcePlatform = String(
		post.source?.platform ?? "original",
	).toLowerCase();
	const sourceLabel =
		sourcePlatform === "devto"
			? t("sourceDevto")
			: sourcePlatform === "medium"
				? t("sourceMedium")
				: sourcePlatform === "original"
					? t("sourceOriginal")
					: t("sourceExternal");
	const coverSrc =
		post.coverImage?.url ||
		(post.coverImage?.asset?._ref
			? urlFor(post.coverImage).width(1600).url()
			: null);

	const renderLinkWithPreview = useCallback((children: ReactNode, hrefRaw?: string) => {
		const href =
			typeof hrefRaw === "string" && hrefRaw.trim().length > 0 ? hrefRaw : "#";
		const isHttp = /^https?:\/\//i.test(href);
		let host = t("linkPreviewUnknown");
		let path = href;

		try {
			const parsed = new URL(href, "https://antxz.local");
			host = parsed.hostname || t("linkPreviewUnknown");
			path = `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
		} catch {
			// Keep fallback values.
		}

		return (
			<HoverCard openDelay={120} closeDelay={120}>
				<HoverCardTrigger asChild>
					<a
						href={href}
						target={isHttp ? "_blank" : undefined}
						rel={isHttp ? "noopener noreferrer" : undefined}
						className="underline decoration-zinc-400 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground"
					>
						{children}
					</a>
				</HoverCardTrigger>
				<HoverCardContent align="start" className="w-80 space-y-2">
					<p className="text-sm font-medium text-foreground">
						{t("linkPreviewTitle")}
					</p>
					<p className="text-xs text-muted-foreground">
						{t("linkPreviewHost", { host })}
					</p>
					<p className="line-clamp-2 break-all text-xs text-muted-foreground">
						{t("linkPreviewPath", { path })}
					</p>
					<a
						href={href}
						target={isHttp ? "_blank" : undefined}
						rel={isHttp ? "noopener noreferrer" : undefined}
						className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-2"
					>
						<ExternalLink className="h-3 w-3" />
						{t("linkPreviewOpen")}
					</a>
				</HoverCardContent>
			</HoverCard>
		);
	}, [t]);

	const ptComponents = useMemo<PortableTextComponents>(() => {
		return {
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
				h2: ({ children, value }) => (
					<h2
						id={getHeadingIdFromBlock((value ?? {}) as PortableTextBlock)}
						className="mt-10 mb-4 scroll-mt-24 font-serif text-3xl font-semibold tracking-tight text-foreground"
					>
						{children}
					</h2>
				),
				h3: ({ children, value }) => (
					<h3
						id={getHeadingIdFromBlock((value ?? {}) as PortableTextBlock)}
						className="mt-8 mb-3 scroll-mt-24 font-serif text-2xl font-semibold text-foreground"
					>
						{children}
					</h3>
				),
				h4: ({ children, value }) => (
					<h4
						id={getHeadingIdFromBlock((value ?? {}) as PortableTextBlock)}
						className="mt-6 mb-2 scroll-mt-24 text-xl font-semibold text-foreground"
					>
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
				link: ({ children, value }) =>
					renderLinkWithPreview(children, value?.href),
			},
		};
	}, [renderLinkWithPreview]);

	useEffect(() => {
		if (!hasToc) {
			setActiveHeadingId(null);
			return;
		}

		const elements = headingItems
			.map((item) => document.getElementById(item.id))
			.filter((el): el is HTMLElement => Boolean(el));

		if (elements.length === 0) {
			setActiveHeadingId(null);
			return;
		}

		setActiveHeadingId(elements[0].id);

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

				if (visible.length > 0) {
					setActiveHeadingId(visible[0].target.id);
				}
			},
			{ rootMargin: "-22% 0px -65% 0px", threshold: [0, 1] },
		);

		for (const el of elements) {
			observer.observe(el);
		}

		return () => observer.disconnect();
	}, [hasToc, headingItems]);

	useEffect(() => {
		let mounted = true;

		const loadArticleLikes = async () => {
			try {
				const payload = await getArticleLikeState(articleKey);
				if (!mounted) return;
				setLikeCount(Number(payload.likeCount ?? 0));
				setUserLiked(Boolean(payload.userLiked));
			} catch {
				// Keep initial server values on request failure.
			}
		};

		loadArticleLikes();

		return () => {
			mounted = false;
		};
	}, [articleKey]);

	const onToggleArticleLike = async () => {
		if (isLiking) return;
		setIsLiking(true);
		setLikeError(null);

		try {
			if (userLiked) {
				await unlikeArticle(articleKey);
			} else {
				await likeArticle(articleKey);
			}

			setUserLiked((prev) => !prev);
			setLikeCount((prev) => Math.max(0, prev + (userLiked ? -1 : 1)));
		} catch (error) {
			setLikeError(getActionErrorMessage(error, t("articleLikeError")));
		} finally {
			setIsLiking(false);
		}
	};

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
			<div className={hasToc
				? "mx-auto flex max-w-300 gap-10 px-5 sm:px-8"
				: "mx-auto max-w-3xl px-5 sm:px-8"
			}>
				<article className="min-w-0 max-w-3xl flex-1">
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

					{/* Category + Tags */}
					{(post.category || (post.tags && post.tags.length > 0)) && (
						<div className="mb-4 flex flex-wrap items-center gap-2">
							{post.category ? (
								<Badge
									variant="default"
									className="font-mono text-xs uppercase tracking-[0.14em]"
								>
									{post.category.title}
								</Badge>
							) : null}
							{(post.tags ?? []).map((tag) => (
								<Badge
									key={tag}
									variant="secondary"
									className="font-mono text-xs tracking-wide"
								>
									#{tag}
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
						<Button
							type="button"
							variant={userLiked ? "default" : "outline"}
							size="sm"
							disabled={isLiking}
							onClick={() => void onToggleArticleLike()}
							className="h-7 px-2.5 text-xs"
						>
							<Heart
								className={
									userLiked
										? "icon-jiggle-once mr-1.5 h-3.5 w-3.5 fill-current"
										: "icon-jiggle-once mr-1.5 h-3.5 w-3.5"
								}
							/>
							{t("articleLikeCount", { count: likeCount })}
						</Button>
						<span className="flex items-center gap-1.5">
							<MessageCircle className="icon-jiggle-once h-3.5 w-3.5" />
							{t("commentsCountShort", { count: post.commentCount ?? 0 })}
						</span>
						<span className="flex items-center gap-1.5">
							{t("sourceLabel", { source: sourceLabel })}
						</span>
						{post.source?.originalUrl ? (
							<a
								href={post.source.originalUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-xs underline underline-offset-2 hover:text-foreground"
							>
								<ExternalLink className="h-3.5 w-3.5" />
								{t("sourceOpen")}
							</a>
						) : null}
					</div>
					{likeError ? (
						<p className="mt-2 text-xs text-red-500">{likeError}</p>
					) : null}

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

				{hasToc && (
					<aside className="hidden lg:block lg:w-64">
						<nav className="sticky top-24 rounded-xl border border-border/70 bg-card/85 p-4 backdrop-blur-sm">
							<p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
								{t("tocTitle")}
							</p>
							<ul className="space-y-1.5">
								{headingItems.map((item) => (
									<li key={item.id}>
										<a
											href={`#${item.id}`}
											className={`relative flex items-center text-sm transition-colors hover:text-foreground ${
												activeHeadingId === item.id
													? "font-medium text-foreground"
													: "text-muted-foreground"
											} ${
												item.level === 2
													? "pl-3"
													: item.level === 3
														? "pl-6"
														: "pl-9"
											}`}
										>
											{activeHeadingId === item.id && (
												<span className="absolute left-0 h-4 w-1 rounded-full bg-foreground/90" aria-hidden="true" />
											)}
											{item.text}
										</a>
									</li>
								))}
							</ul>
						</nav>
					</aside>
				)}
			</div>
		</div>
	);
}
