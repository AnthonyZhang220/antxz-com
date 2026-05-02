// ─── Locale ───────────────────────────────────────────────────────────────────

export type BlogLocale = "en" | "zh";

// ─── Sanity Image ─────────────────────────────────────────────────────────────
// Sanity 返回的图片对象结构，配合 @sanity/image-url 使用

export interface SanityImage {
	_type: "image";
	asset?: {
		_ref: string;
		_type: "reference";
	};
	alt?: string;
	url?: string; // 可选字段，方便直接使用，如果 Sanity schema 里有 url 字段的话
	hotspot?: {
		x: number;
		y: number;
		height: number;
		width: number;
	};
}

// ─── Category / Tag ───────────────────────────────────────────────────────────

export interface BlogCategory {
	_id: string;
	title: string;
	slug: string;
}

// ─── Author ───────────────────────────────────────────────────────────────────

export interface BlogAuthor {
	_id: string;
	name: string;
	avatar?: SanityImage;
	bio?: string;
}

export interface BlogSource {
	platform?: "medium" | "devto" | "original" | string;
	originalUrl?: string;
}

// ─── Blog Post ────────────────────────────────────────────────────────────────
// 完整的文章对象，从 Sanity 查询后返回的结构

export interface BlogPost {
	_id: string;
	slug: string;
	title: string; // 当前 locale 的标题
	excerpt: string; // 当前 locale 的摘要
	body: unknown[]; // Portable Text blocks，传给 PortableText 组件渲染
	coverImage: SanityImage;
	publishedAt: string; // ISO 8601 格式，如 "2026-02-10T00:00:00Z"
	updatedAt?: string;
	readingTime: number; // 分钟数，可在 Sanity 计算或前端估算
	tags: string[];
	source?: BlogSource;
	commentCount?: number;
	likeCount?: number;
	userLiked?: boolean;
	category?: BlogCategory;
	author?: BlogAuthor;
	locale: BlogLocale;
	// 如果 Sanity schema 里用了双语字段，原始数据里会有这两个
	titleLocales?: {
		en: string;
		zh: string;
	};
}

// ─── Blog Post Card ───────────────────────────────────────────────────────────
// 列表页只需要部分字段，不需要完整 body

export type BlogPostCard = Pick<
	BlogPost,
	| "_id"
	| "slug"
	| "title"
	| "excerpt"
	| "coverImage"
	| "publishedAt"
	| "readingTime"
	| "tags"
	| "source"
	| "commentCount"
	| "likeCount"
	| "category"
>;

// ─── Filter Types ─────────────────────────────────────────────────────────────

export type ReadingTimeFilter = "short" | "medium" | "long";

export interface ReadingTimeDef {
	key: ReadingTimeFilter;
	label: string;
	test: (minutes: number) => boolean;
}

export interface BlogFilters {
	tag: string | null;
	yearRange: [number, number];
	readingTime: ReadingTimeFilter | null;
}

// ─── Blog List Page Props ─────────────────────────────────────────────────────

export interface BlogListProps {
	posts: BlogPostCard[];
	allTags: string[];
	minYear: number;
	maxYear: number;
}

// ─── Blog Detail Page Props ───────────────────────────────────────────────────

export interface BlogDetailProps {
	post: BlogPost;
	relatedPosts?: BlogPostCard[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationProps {
	current: number;
	total: number;
	onChange: (page: number) => void;
}

// ─── Table of Contents ────────────────────────────────────────────────────────

export interface TocItem {
	id: string;
	text: string;
	level: 2 | 3 | 4; // h2 / h3 / h4
	children?: TocItem[];
}

// ─── Sanity GROQ Query Result ─────────────────────────────────────────────────
// 从 Sanity 直接拿到的原始数据，locale 字段还没处理

export interface SanityPostRaw {
	_id: string;
	slug: { current: string };
	title: { en: string; zh: string };
	excerpt: { en: string; zh: string };
	body: { en: unknown[]; zh: unknown[] };
	coverImage: SanityImage;
	publishedAt: string;
	updatedAt?: string;
	tags: string[];
	category?: BlogCategory;
	author?: BlogAuthor;
}
