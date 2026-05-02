"use client";

import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BlogPost } from "@/types/blog";
import React, { useEffect, useRef, useState } from "react";

export default function Blogs({
	posts = [],
	speed = 0.2,
}: {
	posts: BlogPost[];
	speed?: number;
}) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const rafRef = useRef<number | null>(null);
	const [isHover, setIsHover] = useState(false);

	// Auto-scroll effect; loops back to start when reaching the end
	useEffect(() => {
		const el = containerRef.current;
		if (!el || posts.length === 0) return;
		if (el.scrollWidth <= el.clientWidth) return;

		let running = true;
		let direction = 1;
		let pendingScroll = 0;

		const step = () => {
			if (!running) return;
			if (!isHover) {
				// Accumulate sub-pixel speed so very slow motion still progresses.
				pendingScroll += speed;
				const delta = Math.floor(pendingScroll);
				if (delta > 0) {
					el.scrollLeft += delta * direction;
					pendingScroll -= delta;
				}
				const maxScrollLeft = el.scrollWidth - el.clientWidth;
				if (el.scrollLeft >= maxScrollLeft) {
					el.scrollLeft = maxScrollLeft;
					direction = -1;
					pendingScroll = 0;
				} else if (el.scrollLeft <= 0) {
					el.scrollLeft = 0;
					direction = 1;
					pendingScroll = 0;
				}
			}
			rafRef.current = requestAnimationFrame(step);
		};

		rafRef.current = requestAnimationFrame(step);

		return () => {
			running = false;
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [posts, speed, isHover]);

	const sorted = [...posts].sort(
		(a, b) =>
			new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
	);

	const getCoverSrc = (post: BlogPost) => {
		if (post.coverImage?.url) return post.coverImage.url;
		if (post.coverImage?.asset?._ref) return urlFor(post.coverImage).url();
		return null;
	};

	return (
		<section className="relative w-full overflow-hidden pt-12 pb-20 md:pt-14 md:pb-24">
			<div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
				<div
					ref={containerRef}
					onMouseEnter={() => setIsHover(true)}
					onMouseLeave={() => setIsHover(false)}
					className="overflow-x-auto pb-2 scrollbar-hide"
				>
					<div className="flex gap-4 sm:gap-5 lg:gap-6">
						{sorted.map((post) => {
							const coverSrc = getCoverSrc(post);

							return (
								<article
									key={post._id}
									className="h-[68vh] min-w-[16rem] w-[78vw] shrink-0 overflow-hidden rounded-sm transition-transform duration-300 hover:-translate-y-0.5 sm:w-[52vw] md:w-[40vw] lg:w-[31vw] xl:w-[24vw]"
								>
									<Link
										href={post.slug ? `/blog/${post.slug}` : "/blog"}
										className="flex h-full flex-col"
									>
										<div className="p-4 flex flex-col justify-start shrink-0">
											<h4 className="text-[clamp(1.35rem,3.6vw,2.2rem)] leading-tight font-bold text-black dark:text-white">
												{post.title}
											</h4>
											{post.excerpt && (
												<p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
													{post.excerpt}
												</p>
											)}
										</div>

										<Separator className="my-3 bg-zinc-300/55 dark:bg-zinc-700/55" />

										<div className="flex-1 overflow-hidden bg-zinc-200 aspect-video relative">
											{coverSrc ? (
												<Image
													src={coverSrc}
													alt={post.title}
													fill
													sizes="(max-width: 639px) 78vw, (max-width: 767px) 52vw, (max-width: 1023px) 40vw, (max-width: 1279px) 30vw, 30vw"
													className="object-cover transition-transform duration-300 hover:scale-105"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
													<span className="text-sm">No cover image</span>
												</div>
											)}
										</div>

										<div className="p-4 shrink-0 flex flex-col items-center gap-2">
											<div className="flex flex-wrap justify-center items-center gap-2">
												{post.tags?.map((tag) => (
													<Badge
														key={tag}
														variant="secondary"
														className="text-md"
													>
														{tag}
													</Badge>
												))}
											</div>
											<span className="text-xs text-zinc-400">
												{new Date(post.publishedAt).toLocaleDateString()}
											</span>
										</div>
									</Link>
								</article>
							);
						})}
						<div className="h-[68vh] min-w-[16rem] w-[78vw] shrink-0 sm:w-[52vw] md:w-[40vw] lg:w-[31vw] xl:w-[24vw] flex items-center justify-center">
							<Link
								href="/blog"
								className="flex h-full w-full items-center justify-center border-l border-zinc-200 dark:border-zinc-800 p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
							>
								<div>
									<p className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">
										See More
									</p>
									<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-600">
										Explore all posts
									</p>
								</div>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
