"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortableText, PortableTextComponents } from "next-sanity";
import { useFormatter, useTranslations } from "next-intl";
import { urlFor } from "@/sanity/lib/image";
import { getActionErrorMessage } from "@/lib/errors/action-error";
import { cn } from "@/lib/shared/utils";
import {
	createPortableTextComponents,
	extractPortableTextHeadingItems,
	getPortableTextHeadingIdFromBlock,
} from "@/components/shared/portable-text-components";
import {
	getArticleLikeState,
	likeArticle,
	getArticleBookmarkState,
	bookmarkArticle,
	unbookmarkArticle,
	unlikeArticle,
} from "@/lib/actions/blog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	ArrowLeft,
	Calendar,
	Clock,
	ExternalLink,
	Heart,
	User,
	Star,
	MessageCircleMore,
} from "lucide-react";

// ─── Main Component ───────────────────────────────────────────────────────────
interface BlogPostPageProps {
	routeLocale: "en" | "zh";
	contentLang: "en" | "zh";
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
		hasEn?: boolean;
		hasZh?: boolean;
		originalLanguage?: "en" | "zh";
	};
}

export default function BlogPostPage({
	routeLocale,
	contentLang,
	post,
}: BlogPostPageProps) {
	const router = useRouter();
	const t = useTranslations("blog");
	const fmt = useFormatter();
	const articleKey = useMemo(() => `blog:${post.slug}`, [post.slug]);
	const headingItems = useMemo(() => extractPortableTextHeadingItems(post.body), [post.body]);
	const hasToc = headingItems.length > 0;
	const readingTime = post.readingTime ?? 1;
	const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
	const [userLiked, setUserLiked] = useState(false);
	const [isLiking, setIsLiking] = useState(false);
	const [likeError, setLikeError] = useState<string | null>(null);
	const [userBookmarked, setUserBookmarked] = useState(false);
	const [isBookmarking, setIsBookmarking] = useState(false);
	const [bookmarkError, setBookmarkError] = useState<string | null>(null);
	const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
	const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
	const [authDialogMessage, setAuthDialogMessage] = useState<string>("");

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
	const canSwitchToEn = Boolean(post.hasEn);
	const canSwitchToZh = Boolean(post.hasZh);
	const toEnHref = `/${routeLocale}/blog/${post.slug}?lang=en`;
	const toZhHref = `/${routeLocale}/blog/${post.slug}?lang=zh`;
	const originalLanguage = post.originalLanguage === "zh" ? "zh" : "en";
	const originalLanguageLabel =
		originalLanguage === "zh"
			? t("originalLanguageZh")
			: t("originalLanguageEn");
	const currentLanguageLabel =
		contentLang === "zh" ? t("filterLanguageZh") : t("filterLanguageEn");
	const showTranslationNotice = contentLang !== originalLanguage;

	const showAuthRequiredDialog = useCallback((message: string) => {
		setAuthDialogMessage(message);
		setIsAuthDialogOpen(true);
	}, []);

	const scrollToAnchor = useCallback((targetId: string) => {
		const target = document.getElementById(targetId);
		if (!target) return;

		const offsetTop = 104;
		const nextTop = target.getBoundingClientRect().top + window.scrollY - offsetTop;
		window.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
		window.history.replaceState(null, "", `#${targetId}`);

		if (hasToc) {
			setActiveHeadingId(targetId);
		}
	}, [hasToc]);

	const ptComponents = useMemo<PortableTextComponents>(() => {
		return createPortableTextComponents({
			t,
			imageWidth: 1200,
			headingIdResolver: getPortableTextHeadingIdFromBlock,
		});
	}, [t]);

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

		const loadArticleEngagement = async () => {
			try {
				const [likePayload, bookmarkPayload] = await Promise.all([
					getArticleLikeState(articleKey),
					getArticleBookmarkState(articleKey),
				]);
				if (!mounted) return;
				setLikeCount(Number(likePayload.likeCount ?? 0));
				setUserLiked(Boolean(likePayload.userLiked));
				setUserBookmarked(Boolean(bookmarkPayload.userBookmarked));
			} catch {
				// Keep initial server values on request failure.
			}
		};

		loadArticleEngagement();

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
			const message = getActionErrorMessage(error, t("articleLikeError"));
			if (message === t("articleLikeLoginRequired")) {
				showAuthRequiredDialog(message);
				return;
			}
			setLikeError(message);
		} finally {
			setIsLiking(false);
		}
	};

	const onToggleArticleBookmark = async () => {
		if (isBookmarking) return;
		setIsBookmarking(true);
		setBookmarkError(null);

		try {
			if (userBookmarked) {
				await unbookmarkArticle(articleKey);
			} else {
				await bookmarkArticle(articleKey);
			}

			setUserBookmarked((prev) => !prev);
		} catch (error) {
			const message = getActionErrorMessage(error, t("articleBookmarkError"));
			if (message === t("articleBookmarkLoginRequired")) {
				showAuthRequiredDialog(message);
				return;
			}
			setBookmarkError(message);
		} finally {
			setIsBookmarking(false);
		}
	};

	return (
		<>
			<AlertDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("authPromptTitle")}</AlertDialogTitle>
						<AlertDialogDescription>
							{authDialogMessage || t("authPromptDescription")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("authPromptCancel")}</AlertDialogCancel>
						<AlertDialogAction onClick={() => router.push(`/${routeLocale}/auth/sign-up`)}>
							{t("authPromptSignup")}
						</AlertDialogAction>
						<AlertDialogAction onClick={() => router.push(`/${routeLocale}/auth/login`)}>
							{t("authPromptLogin")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

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
			<div className="mx-auto flex max-w-300 justify-center gap-3 px-5 sm:px-8 lg:gap-4">
				<article className="min-w-0 w-full max-w-3xl lg:flex-1">
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

					{/* Content language toggle — only shown when both languages exist */}
					{canSwitchToEn && canSwitchToZh && (
						<div className="mb-5">
							<p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
								{t("contentLanguage")}
							</p>
							<div
								role="tablist"
								aria-label={t("contentLanguage")}
								className="inline-flex items-center rounded-xl border border-border bg-muted/60 p-1 shadow-sm"
							>
								<Button
									type="button"
									size="sm"
									variant="ghost"
									role="tab"
									aria-selected={contentLang === "en"}
									onClick={() => router.push(toEnHref)}
									className={cn(
										"h-8 w-16 rounded-lg px-3.5 font-mono text-xs transition-all duration-150",
										contentLang === "en"
											? "bg-foreground text-background shadow-sm"
											: "text-muted-foreground hover:bg-background/70 hover:text-foreground",
									)}
								>
									English
								</Button>
								<Button
									type="button"
									size="sm"
									variant="ghost"
									role="tab"
									aria-selected={contentLang === "zh"}
									onClick={() => router.push(toZhHref)}
									className={cn(
										"h-8 w-16 rounded-lg px-3.5 font-mono text-xs transition-all duration-150",
										contentLang === "zh"
											? "bg-foreground text-background shadow-sm"
											: "text-muted-foreground hover:bg-background/70 hover:text-foreground",
									)}
								>
									中文
								</Button>
							</div>
							<p className="mt-2 text-xs text-muted-foreground">
								{t("originalLanguageLabel", {
									language: originalLanguageLabel,
								})}
							</p>
						</div>
					)}

					{canSwitchToEn && canSwitchToZh && showTranslationNotice && (
						<p className="mb-5 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
							{t("translationNotice", {
								from: originalLanguageLabel,
								to: currentLanguageLabel,
							})}
						</p>
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
					{likeError || bookmarkError ? (
						<p className="mt-2 text-xs text-red-500">
							{likeError ?? bookmarkError}
						</p>
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

				<aside className="hidden lg:block lg:flex-none lg:w-fit">
					<div className="sticky top-24 space-y-4">
						<div className="flex w-fit flex-col items-center gap-1 rounded-2xl border border-border py-3 px-3">
							{/* Like */}
							<button
								type="button"
								onClick={() => void onToggleArticleLike()}
								disabled={isLiking}
								aria-label={userLiked ? t("articleUnlike") : t("articleLike")}
								className="icon-jiggle-group flex flex-col items-center gap-0.5 p-2"
							>
								<Heart
									className={cn(
										"icon-jiggle-once h-8 w-8 transition-all",
										userLiked
											? "fill-current text-red-500"
											: "text-muted-foreground",
									)}
								/>
								<span className="text-xs text-muted-foreground">{likeCount}</span>
							</button>

							{/* Comments */}
							<Link
								href="#comments"
								onClick={(event) => {
									event.preventDefault();
									scrollToAnchor("comments");
								}}
								aria-label={t("commentsCountShort", { count: post.commentCount ?? 0 })}
								className="icon-jiggle-group flex flex-col items-center gap-0.5 p-2"
							>
								<MessageCircleMore className="icon-jiggle-once h-8 w-8 transition-all text-muted-foreground" />
								<span className="text-xs text-muted-foreground">{post.commentCount ?? 0}</span>
							</Link>

							{/* Bookmark */}
							<button
								type="button"
								onClick={() => void onToggleArticleBookmark()}
								disabled={isBookmarking}
								aria-label={userBookmarked ? t("articleUnbookmark") : t("articleBookmark")}
								className="icon-jiggle-group flex flex-col items-center gap-0.5 p-2"
							>
								<Star
									className={cn(
										"icon-jiggle-once h-8 w-8 transition-all",
										userBookmarked
											? "fill-current text-amber-500"
											: "text-muted-foreground",
									)}
								/>
								<span className="text-xs text-muted-foreground">
									{userBookmarked ? t("articleUnbookmark") : t("articleBookmark")}
								</span>
							</button>
						</div>

						{hasToc && (
							<nav className="max-w-xs rounded-xl border border-border/70 bg-card/85 p-4 backdrop-blur-sm">
								<p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
									{t("tocTitle")}
								</p>
								<ul className="space-y-1.5">
									{headingItems.map((item) => (
										<li key={item.id}>
											<a
												href={`#${item.id}`}
												onClick={(event) => {
													event.preventDefault();
													scrollToAnchor(item.id);
												}}
												className={`relative flex items-center text-sm transition-colors hover:text-foreground wrap-break-word ${
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
													<span
														className="absolute left-0 h-4 w-1 rounded-full bg-foreground/90"
														aria-hidden="true"
													/>
												)}
												{item.text} 
											</a>
										</li>
									))}
								</ul>
							</nav>
						)}
					</div>
				</aside>
			</div>

			{/* Mobile/Tablet floating action rail */}
			<div className="fixed right-4 bottom-4 z-40 lg:hidden">
				<div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card/95 px-2 py-2 shadow-lg backdrop-blur supports-backdrop-filter:bg-card/80">
					<button
						type="button"
						onClick={() => void onToggleArticleLike()}
						disabled={isLiking}
						aria-label={userLiked ? t("articleUnlike") : t("articleLike")}
						className="icon-jiggle-group flex flex-col items-center gap-0.5 p-1.5"
					>
						<Heart
							className={cn(
								"icon-jiggle-once h-6 w-6 transition-all",
								userLiked
									? "fill-current text-red-500"
									: "text-muted-foreground",
							)}
						/>
						<span className="text-[10px] text-muted-foreground">{likeCount}</span>
					</button>

					<Link
						href="#comments"
						onClick={(event) => {
							event.preventDefault();
							scrollToAnchor("comments");
						}}
						aria-label={t("commentsCountShort", { count: post.commentCount ?? 0 })}
						className="icon-jiggle-group flex flex-col items-center gap-0.5 p-1.5"
					>
						<MessageCircleMore className="icon-jiggle-once h-6 w-6 transition-all text-muted-foreground" />
						<span className="text-[10px] text-muted-foreground">{post.commentCount ?? 0}</span>
					</Link>

					<button
						type="button"
						onClick={() => void onToggleArticleBookmark()}
						disabled={isBookmarking}
						aria-label={userBookmarked ? t("articleUnbookmark") : t("articleBookmark")}
						className="icon-jiggle-group flex flex-col items-center gap-0.5 p-1.5"
					>
						<Star
							className={cn(
								"icon-jiggle-once h-6 w-6 transition-all",
								userBookmarked
									? "fill-current text-amber-500"
									: "text-muted-foreground",
							)}
						/>
					</button>
				</div>
			</div>
			</div>
		</>
	);
}
