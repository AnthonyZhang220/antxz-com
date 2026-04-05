"use client";

import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { BlogPost } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Clock,
	Calendar,
	ChevronLeft,
	ChevronRight,
	SlidersHorizontal,
	X,
} from "lucide-react";
import BlogFilter from "@/components/blog/blog-filter";
import { useBlogFilter } from "@/hooks/useBlogFilter";
import { Separator } from "@/components/ui/separator";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 5;

// ─── Section Label ────────────────────────────────────────────────────────────

// ─── Featured Card ────────────────────────────────────────────────────────────
function FeaturedCard({ post }: { post: BlogPost }) {
	const fmt = useFormatter();
	const t = useTranslations("blog");
	return (
		<Link href={`/blog/${post.slug}`} className="group block rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow duration-300 mb-2">
			<div className="relative aspect-21/9 overflow-hidden">
				<Image
					src={
						post.coverImage.url ||
						(post.coverImage.asset?._ref ? urlFor(post.coverImage).url() : "")
					}
					alt={post.title}
					fill
					className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
				<span className="absolute top-3.5 left-3.5 font-mono text-xs uppercase tracking-[0.14em] bg-card/90 text-foreground px-2.5 py-1 rounded-md">
					{t("featured")}
				</span>
				<div className="absolute bottom-0 left-0 right-0 p-5">
					<div className="flex gap-2 mb-2">
						{post.tags.map((t) => (
							<span
								key={t}
								className="font-mono text-xs uppercase tracking-widest text-white/65"
							>
								{t}
							</span>
						))}
					</div>
					<h2 className="font-serif text-xl md:text-2xl font-bold text-white leading-snug tracking-tight">
						{post.title}
					</h2>
				</div>
			</div>
			<div className="px-5 pt-4 pb-5 bg-card">
				<p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3">
					{post.excerpt}
				</p>
				<div className="flex items-center gap-4">
					<span className="flex items-center gap-1.5 font-mono text-xs md:text-sm text-muted-foreground/70">
						<Calendar className="h-3 w-3" />
						{fmt.dateTime(new Date(post.publishedAt), "short")}
					</span>
					<span className="flex items-center gap-1.5 font-mono text-xs md:text-sm text-muted-foreground/70">
						<Clock className="h-3 w-3" />
						{t("readingTime", { minutes: post.readingTime })}
					</span>
				</div>
			</div>
		</Link>
	);
}

// ─── Small Card ───────────────────────────────────────────────────────────────
function SmallCard({ post }: { post: BlogPost }) {
	const fmt = useFormatter();
	const t = useTranslations("blog");
	return (
		<Link href={`/blog/${post.slug}`} className="group flex gap-4 py-4.5 border-b border-border/50 last:border-0">
			<div className="w-36 shrink-0 aspect-3/2 rounded-lg overflow-hidden bg-muted relative">
				<Image
					src={
						post.coverImage.url ||
						(post.coverImage.asset?._ref ? urlFor(post.coverImage).url() : "")
					}
					alt={post.title}
					fill
					sizes="(max-width: 768px)"
					className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
				/>
			</div>
			<div className="flex-1 flex flex-col justify-center gap-1.5">
				<div className="flex gap-1.5">
					{post.tags.slice(0, 2).map((t) => (
						<Badge
							key={t}
							variant="default"
							className="font-mono text-xs uppercase tracking-wider px-1.5 py-0 h-4"
						>
							{t}
						</Badge>
					))}
				</div>
				<h3 className="font-serif text-base md:text-lg font-semibold leading-snug text-foreground group-hover:text-muted-foreground transition-colors duration-150 line-clamp-2">
					{post.title}
				</h3>
				<span>
					{post.excerpt && (
						<p className="text-sm text-muted-foreground line-clamp-3">
							{post.excerpt}
						</p>
					)}
				</span>
				<div className="flex items-center gap-3">
					<span className="flex items-center gap-1 font-mono text-xs text-muted-foreground/70">
						<Calendar className="h-2.5 w-2.5" />
						{fmt.dateTime(new Date(post.publishedAt), "short")}
					</span>
					<span className="flex items-center gap-1 font-mono text-xs text-muted-foreground/70">
						<Clock className="h-2.5 w-2.5" />
						{t("readingTimeShort", { minutes: post.readingTime })}
					</span>
				</div>
			</div>
		</Link>
	);
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
	current,
	total,
	onChange,
}: {
	current: number;
	total: number;
	onChange: (p: number) => void;
}) {
	if (total <= 1) return null;

	const pages: (number | "…")[] = [];
	for (let i = 1; i <= total; i++) {
		if (i === 1 || i === total || Math.abs(i - current) <= 1) pages.push(i);
		else if (pages[pages.length - 1] !== "…") pages.push("…");
	}

	return (
		<div className="flex items-center justify-center gap-1 mt-10 pt-7 border-t border-border/50">
			<Button
				variant="outline"
				size="icon"
				className="h-8 w-8 rounded-lg"
				disabled={current === 1}
				onClick={() => onChange(current - 1)}
			>
				<ChevronLeft className="h-3.5 w-3.5" />
			</Button>

			{pages.map((p, i) =>
				p === "…" ? (
					<span
						key={`e${i}`}
						className="w-8 h-8 flex items-center justify-center text-muted-foreground/70 text-sm font-mono"
					>
						…
					</span>
				) : (
					<Button
						key={p}
						variant={p === current ? "default" : "outline"}
						size="icon"
						className="h-8 w-8 rounded-lg font-mono text-xs"
						onClick={() => onChange(p)}
					>
						{p}
					</Button>
				),
			)}

			<Button
				variant="outline"
				size="icon"
				className="h-8 w-8 rounded-lg"
				disabled={current === total}
				onClick={() => onChange(current + 1)}
			>
				<ChevronRight className="h-3.5 w-3.5" />
			</Button>
		</div>
	);
}

// ─── Blog List Page ───────────────────────────────────────────────────────────
interface Props {
	posts: BlogPost[];
	allTags: string[];
	minYear: number;
	maxYear: number;
}

export default function BlogListPage({
	posts,
	allTags,
	minYear,
	maxYear,
}: Props) {
	const t = useTranslations("blog");

	// delegate filter state/logic to custom hook
	const {
		filtered,
		tag,
		setTag,
		yearRange,
		setYearRange,
		readTime,
		setReadTime,
		page,
		setPage,
		go,
		isDefault,
		clearAll,
		tagCounts,
		allYears,
	} = useBlogFilter(posts, minYear, maxYear);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pagePosts = filtered.slice(
		(safePage - 1) * PAGE_SIZE,
		safePage * PAGE_SIZE,
	);
	const featured = isDefault && safePage === 1 ? posts[0] : null;
	const listPosts = featured
		? pagePosts.filter((p) => p.slug !== featured.slug)
		: pagePosts;

	return (
		<main className="min-h-screen bg-background text-base md:text-lg">
			<div className="max-w-5xl mx-auto px-6 py-14">
				{/* ── Header ── */}
				<div className="mb-10">
					<p className="font-mono text-sm md:text-base uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">
						{t("writingCount", { count: filtered.length })}
					</p>
					<h1 className="font-serif text-6xl font-bold text-foreground tracking-tight leading-none">
						{t("title")}
					</h1>
				</div>

				{/* ── Body ── */}
				<div className="flex flex-col gap-8 md:gap-10 lg:flex-row lg:items-start">
					{/* Filters (mobile/tablet) */}
					<div className="lg:hidden">
						<Sheet>
							<SheetTrigger asChild>
								<Button
									variant="outline"
									className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em]"
								>
									<SlidersHorizontal className="h-3.5 w-3.5" />
									Filters
								</Button>
							</SheetTrigger>
							<SheetContent side="top" className="h-screen w-screen max-w-none p-0 overflow-y-auto">
								<div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-4 backdrop-blur supports-backdrop-filter:bg-background/75">
									<p className="font-mono text-xs uppercase tracking-[0.14em] text-foreground/90">
										Filters
									</p>
									<SheetClose asChild>
										<Button variant="ghost" size="icon" aria-label="Close filters">
											<X className="h-4 w-4" />
										</Button>
									</SheetClose>
								</div>
								<div className="p-4 sm:p-6">
									<BlogFilter
										posts={posts}
										tag={tag}
										setTag={setTag}
										allTags={allTags}
										tagCounts={tagCounts}
										yearRange={yearRange}
										setYearRange={setYearRange}
										minYear={minYear}
										maxYear={maxYear}
										allYears={allYears}
										readTime={readTime}
										setReadTime={setReadTime}
										isDefault={isDefault}
										clearAll={clearAll}
										go={go}
									/>
								</div>
							</SheetContent>
						</Sheet>
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						{featured && <FeaturedCard post={featured} />}

						{listPosts.length === 0 && !featured && (
							<div className="py-16 text-center">
								<p className="font-mono text-lg text-muted-foreground/70 mb-4">
									{t("noMatches")}
								</p>
								<Button
									variant="outline"
									size="lg"
									className="font-mono text-xs"
									onClick={clearAll}
								>
									{t("clearFilters")}
								</Button>
							</div>
						)}

						{listPosts.map((post) => (
							<SmallCard key={post.slug} post={post} />
						))}

						<Pagination
							current={safePage}
							total={totalPages}
							onChange={setPage}
						/>
					</div>
					<Separator orientation="vertical" className="hidden self-stretch h-auto lg:block" />
					{/* Filters sidebar (desktop) */}
					<div className="hidden lg:block">
						<BlogFilter
							posts={posts}
							tag={tag}
							setTag={setTag}
							allTags={allTags}
							tagCounts={tagCounts}
							yearRange={yearRange}
							setYearRange={setYearRange}
							minYear={minYear}
							maxYear={maxYear}
							allYears={allYears}
							readTime={readTime}
							setReadTime={setReadTime}
							isDefault={isDefault}
							clearAll={clearAll}
							go={go}
						/>
					</div>
				</div>
			</div>
		</main>
	);
}
