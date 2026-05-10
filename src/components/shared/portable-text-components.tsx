import Image from "next/image";
import type { ReactNode } from "react";
import type { PortableTextBlock } from "@portabletext/types";
import type { PortableTextComponents } from "next-sanity";
import { ExternalLink } from "lucide-react";

import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { urlFor } from "@/sanity/lib/image";

export type BlogPortableTextTranslation = (
	key: string,
	values?: Record<string, string | number>,
) => string;

type CreatePortableTextComponentsOptions = {
	t?: BlogPortableTextTranslation;
	imageWidth?: number;
	headingIdResolver?: (block: PortableTextBlock) => string;
	renderLink?: (children: ReactNode, hrefRaw?: string) => ReactNode;
};

export interface PortableTextHeadingItem {
	id: string;
	text: string;
	level: 2 | 3 | 4;
}

interface PortableTextHeadingBlock {
	_type?: string;
	_key?: string;
	style?: string;
	children?: Array<{ _type?: string; text?: string }>;
}

function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function extractBlockText(block: PortableTextHeadingBlock): string {
	return (block.children ?? [])
		.filter(
			(child) => child?._type === "span" && typeof child.text === "string",
		)
		.map((child) => child.text)
		.join("")
		.trim();
}

export function getPortableTextHeadingIdFromBlock(
	block: PortableTextHeadingBlock,
): string {
	if (typeof block._key === "string" && block._key.trim().length > 0) {
		return `heading-${block._key}`;
	}

	const text = extractBlockText(block);
	return `heading-${slugifyHeading(text) || "section"}`;
}

export function extractPortableTextHeadingItems(
	body?: unknown[],
): PortableTextHeadingItem[] {
	if (!Array.isArray(body)) return [];

	const idCounts = new Map<string, number>();
	const results: PortableTextHeadingItem[] = [];

	for (const raw of body) {
		const block = raw as PortableTextHeadingBlock;
		if (block?._type !== "block") continue;
		if (block.style !== "h2" && block.style !== "h3" && block.style !== "h4") {
			continue;
		}

		const text = extractBlockText(block);
		if (!text) continue;

		const base = slugifyHeading(text) || "section";
		const seen = idCounts.get(base) ?? 0;
		idCounts.set(base, seen + 1);
		const rawId = getPortableTextHeadingIdFromBlock(block);
		const id = seen === 0 ? rawId : `${rawId}-${seen + 1}`;

		results.push({
			id,
			text,
			level: Number(block.style.slice(1)) as 2 | 3 | 4,
		});
	}

	return results;
}

function defaultRenderLink(children: ReactNode, hrefRaw?: string): ReactNode {
	let href =
		typeof hrefRaw === "string" && hrefRaw.trim().length > 0 ? hrefRaw : "#";
	
	// 自动为缺少协议的外部链接添加 https://
	if (href !== "#" && !href.startsWith("/") && !href.startsWith("#") && !/^https?:\/\//i.test(href)) {
		// 如果看起来像外部链接（包含点号），添加 https://
		if (href.includes(".")) {
			href = `https://${href}`;
		}
	}
	
	const isHttp = /^https?:\/\//i.test(href);

	return (
		<a
			href={href}
			target={isHttp ? "_blank" : undefined}
			rel={isHttp ? "noopener noreferrer" : undefined}
			className="rounded-sm px-0.5 font-medium text-cyan-700 underline decoration-2 decoration-cyan-500/80 underline-offset-3 transition-all hover:bg-cyan-100/70 hover:text-cyan-800 hover:decoration-cyan-700 dark:text-cyan-300 dark:decoration-cyan-400/80 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-200 dark:hover:decoration-cyan-200"
		>
			{children}
		</a>
	);
}

export function createPortableTextComponents(
	options: CreatePortableTextComponentsOptions = {},
): PortableTextComponents {
	const imageWidth = options.imageWidth ?? 1200;
	const headingIdResolver = options.headingIdResolver ?? getPortableTextHeadingIdFromBlock;

	// 支持 t 参数自动切换 link 预览
	let renderLink: (children: ReactNode, hrefRaw?: string) => ReactNode;
	if (options.t) {
		renderLink = (children, hrefRaw) => {
			let href =
				typeof hrefRaw === "string" && hrefRaw.trim().length > 0 ? hrefRaw : "#";
			if (href !== "#" && !href.startsWith("/") && !href.startsWith("#") && !/^https?:\/\//i.test(href)) {
				if (href.includes(".")) {
					href = `https://${href}`;
				}
			}
			const isHttp = /^https?:\/\//i.test(href);
			let host = options.t!("linkPreviewUnknown");
			let path = href;
			try {
				const parsed = new URL(href, "https://antxz.local");
				host = parsed.hostname || options.t!("linkPreviewUnknown");
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
							className="rounded-sm px-0.5 font-medium text-cyan-700 underline decoration-2 decoration-cyan-500/80 underline-offset-3 transition-all hover:bg-cyan-100/70 hover:text-cyan-800 hover:decoration-cyan-700 dark:text-cyan-300 dark:decoration-cyan-400/80 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-200 dark:hover:decoration-cyan-200"
						>
							{children}
						</a>
					</HoverCardTrigger>
					<HoverCardContent align="start" className="w-80 space-y-2">
						<p className="text-sm font-medium text-foreground">
							{options.t!("linkPreviewTitle")}
						</p>
						<p className="text-xs text-muted-foreground">
							{options.t!("linkPreviewHost", { host })}
						</p>
						<p className="line-clamp-2 break-all text-xs text-muted-foreground">
							{options.t!("linkPreviewPath", { path })}
						</p>
						<a
							href={href}
							target={isHttp ? "_blank" : undefined}
							rel={isHttp ? "noopener noreferrer" : undefined}
							className="inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-xs font-semibold text-cyan-700 underline decoration-2 decoration-cyan-500/80 underline-offset-2 transition-all hover:bg-cyan-100/70 hover:text-cyan-800 dark:text-cyan-300 dark:decoration-cyan-400/80 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-200"
						>
							<ExternalLink className="h-3 w-3" />
							{options.t!("linkPreviewOpen")}
						</a>
					</HoverCardContent>
				</HoverCard>
			);
		};
	} else {
		renderLink = options.renderLink ?? defaultRenderLink;
	}

	return {
		   types: {
			   image: ({ value }) => {
				   let src = value?.asset?._ref
					   ? urlFor(value)
						   .width(imageWidth)
						   .auto('format')
						   .fit('max')
						   .quality(80)
						   .url()
					   : value?.url;
				   if (!src) return null;

				   // GIF 优化：如果是 gif，尝试用 <video> 标签懒加载 MP4/WebM
				   const isGif = src.endsWith('.gif') || (value?.asset?.mimeType === 'image/gif');
				   const mp4Src = isGif && src.replace(/\.gif($|\?)/, '.mp4$1');
				   const webmSrc = isGif && src.replace(/\.gif($|\?)/, '.webm$1');

				   return (
					   <figure className="my-8">
						   <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-card/70">
							   {isGif ? (
								   <video
									   controls
									   autoPlay
									   loop
									   muted
									   playsInline
									   poster={src}
									   className="object-cover w-full h-full"
									   style={{ display: 'block' }}
								   >
									   <source src={webmSrc} type="video/webm" />
									   <source src={mp4Src} type="video/mp4" />
									   <img src={src} alt={value?.caption ?? ''} loading="lazy" />
								   </video>
							   ) : (
								   <Image
									   src={src}
									   alt={value?.caption ?? ''}
									   fill
									   className="object-cover"
									   loading="lazy"
									   sizes="(max-width: 768px) 100vw, 800px"
									   placeholder={value?.lqip ? 'blur' : undefined}
									   blurDataURL={value?.lqip}
								   />
							   )}
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
			h1: ({ children, value }) => (
				<h1
					id={
						options.headingIdResolver
							? options.headingIdResolver((value ?? {}) as PortableTextBlock)
							: undefined
					}
					className="mt-10 mb-4 scroll-mt-24 font-serif text-5xl font-bold tracking-tight text-foreground"
				>
					{children}
				</h1>
			),
			h2: ({ children, value }) => (
				<h2
					id={headingIdResolver((value ?? {}) as PortableTextBlock)}
					className="mt-10 mb-4 scroll-mt-24 font-serif text-4xl font-semibold tracking-tight text-foreground"
				>
					{children}
				</h2>
			),
			h3: ({ children, value }) => (
				<h3
					id={headingIdResolver((value ?? {}) as PortableTextBlock)}
					className="mt-8 mb-3 scroll-mt-24 font-serif text-3xl font-semibold text-foreground"
				>
					{children}
				</h3>
			),
			h4: ({ children, value }) => (
				<h4
					id={headingIdResolver((value ?? {}) as PortableTextBlock)}
					className="mt-6 mb-2 scroll-mt-24 text-2xl font-semibold text-foreground"
				>
					{children}
				</h4>
			),
			normal: ({ children }) => (
				<p className="my-5 leading-8 text-lg text-zinc-700 dark:text-zinc-300">{children}</p>
			),
			blockquote: ({ children }) => (
				<blockquote className="my-6 border-l-4 border-zinc-400 pl-6 py-2 bg-zinc-50 dark:bg-zinc-900/30 rounded-r-lg italic text-lg text-zinc-800 dark:text-zinc-200">
					{children}
				</blockquote>
			),
		},
		list: {
			bullet: ({ children }) => (
				<ul className="my-5 ml-6 list-disc space-y-2 text-lg text-zinc-700 dark:text-zinc-300">
					{children}
				</ul>
			),
			number: ({ children }) => (
				<ol className="my-5 ml-6 list-decimal space-y-2 text-lg text-zinc-700 dark:text-zinc-300">
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
				<strong className="rounded-sm bg-amber-200/80 px-1.5 py-0.5 font-extrabold text-zinc-950 shadow-[inset_0_-1px_0_rgba(120,53,15,0.35)] dark:bg-amber-500/25 dark:text-zinc-50 dark:shadow-[inset_0_-1px_0_rgba(251,191,36,0.35)]">{children}</strong>
			),
			em: ({ children }) => <em className="italic">{children}</em>,
			code: ({ children }) => (
				<code className="rounded-md border border-cyan-300/70 bg-cyan-50/95 px-1.5 py-0.5 font-mono text-[0.9em] tracking-tight text-cyan-900 shadow-[0_1px_0_rgba(8,145,178,0.25)] dark:border-cyan-700/70 dark:bg-cyan-950/40 dark:text-cyan-100">
					{children}
				</code>
			),
			link: ({ children, value }) => renderLink(children, value?.href),
		},
	};
}
