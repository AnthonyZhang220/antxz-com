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
	speed = 0.5,
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

		let running = true;

		const step = () => {
			if (!running) return;
			if (!isHover) {
				// increment scroll
				el.scrollLeft += speed;
				if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
					// smooth jump back to start
					el.scrollLeft = 0;
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

	return (
		<section className="w-full bg-white dark:bg-black">
			<div className="w-full">
				<div
					ref={containerRef}
					onMouseEnter={() => setIsHover(true)}
					onMouseLeave={() => setIsHover(false)}
					className="overflow-x-auto scrollbar-hide"
				>
					<div className="flex gap-6 px-4">
						{sorted.map((post) => (
							<article
								key={post._id}
								className="min-w-[calc(100vw/3-10rem)] shrink-0 h-[70vh] overflow-hidden flex flex-col"
							>
								<Link
									href={post.slug ? `/blog/${post.slug}` : "/blog"}
									className="flex flex-col h-full"
								>
									<div className="p-4 flex flex-col justify-start shrink-0">
										<h4 className="text-[clamp(1.5rem,4vw,2.5rem)] leading-tight font-bold text-black dark:text-white">
											{post.title}
										</h4>
										{post.excerpt && (
											<p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
												{post.excerpt}
											</p>
										)}
									</div>
									<Separator className="my-2" />
									<div className="flex-1  overflow-hidden bg-zinc-200 aspect-video relative">
										<Image
											src={
												post.coverImage.url ||
												(post.coverImage.asset?._ref
													? urlFor(post.coverImage).url()
													: "")
											}
											alt={post.title}
											fill
											sizes="(max-width: 768px) 100vw, 33vw"
											className="object-cover transition-transform duration-300 hover:scale-105"
										/>
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
						))}
						<div className="min-w-[calc(100vw/3-10rem)] shrink-0 h-[70vh] flex items-center justify-center">
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
