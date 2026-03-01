// 开发阶段用于测试 UI 的假数据，上线后删掉，换成 Sanity 查询

import type { BlogPost } from "@/types/blog";

export const samplePosts: BlogPost[] = [
	{
		_id: "post-001",
		slug: "building-personal-platform-nextjs",
		title: "Building a Personal Platform with Next.js 14 and Sanity",
		excerpt:
			"A deep dive into architecting a modern full-stack personal website — from monorepo setup to i18n routing and CMS integration.",
		body: [
			{
				_type: "block",
				_key: "block-001",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "span-001",
						text: "When I decided to rebuild my personal website, I wanted something that would scale with my needs — not just a static page, but a full platform.",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "block-002",
				style: "h2",
				children: [
					{
						_type: "span",
						_key: "span-002",
						text: "Why Next.js 14?",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "block-003",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "span-003",
						text: "The App Router finally made server components a first-class citizen, which means less JavaScript shipped to the client.",
						marks: [],
					},
				],
			},
		],
		coverImage: {
			_type: "image",
			alt: "Next.js code on a dark screen",
			url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
			hotspot: { x: 0.5, y: 0.5, height: 0.8, width: 0.8 },
		},
		publishedAt: "2026-02-10T00:00:00Z",
		updatedAt: "2026-02-12T00:00:00Z",
		readingTime: 8,
		tags: ["Next.js", "TypeScript"],
		locale: "en",
		titleLocales: {
			en: "Building a Personal Platform with Next.js 14 and Sanity",
			zh: "使用 Next.js 14 和 Sanity 构建个人平台",
		},
		category: {
			_id: "cat-001",
			title: "Engineering",
			slug: "engineering",
		},
		author: {
			_id: "author-001",
			name: "Your Name",
			bio: "Full-stack developer based in somewhere.",
			avatar: {
				_type: "image",
				alt: "Your Name avatar",
				url: "https://api.dicebear.com/7.x/avataaars/svg?seed=yourname",
			},
		},
	},
	{
		_id: "post-002",
		slug: "bilingual-content-strategy-sanity",
		title: "Bilingual Content Strategy with Sanity.io",
		excerpt:
			"How to structure your Sanity schema to support EN/ZH content without duplicating documents — a practical field guide.",
		body: [
			{
				_type: "block",
				_key: "block-101",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "span-101",
						text: "Managing bilingual content is one of the trickiest parts of building an internationalized platform. Here's how I solved it with Sanity.",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "block-102",
				style: "h2",
				children: [
					{
						_type: "span",
						_key: "span-102",
						text: "Single Document vs Separate Documents",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "block-103",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "span-103",
						text: "Rather than maintaining two separate post documents per language, I opted for a single document with locale-keyed fields.",
						marks: [],
					},
				],
			},
		],
		coverImage: {
			_type: "image",
			alt: "Sanity Studio interface",
			url: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
		},
		publishedAt: "2024-05-18T00:00:00Z",
		readingTime: 5,
		tags: ["Sanity", "i18n"],
		locale: "en",
		titleLocales: {
			en: "Bilingual Content Strategy with Sanity.io",
			zh: "使用 Sanity.io 的双语内容策略",
		},
		category: {
			_id: "cat-002",
			title: "CMS",
			slug: "cms",
		},
		author: {
			_id: "author-001",
			name: "Your Name",
			avatar: {
				_type: "image",
				alt: "Your Name avatar",
				url: "https://api.dicebear.com/7.x/avataaars/svg?seed=yourname",
			},
		},
	},
	{
		_id: "post-003",
		slug: "tailwind-shadcn-design-system",
		title: "Crafting a Design System with Tailwind and shadcn/ui",
		excerpt:
			"Lessons learned from building a cohesive design system using Tailwind CSS utility classes and shadcn component primitives.",
		body: [
			{
				_type: "block",
				_key: "block-201",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "span-201",
						text: "shadcn/ui changed how I think about component libraries. Instead of installing a package, you own the code.",
						marks: [],
					},
				],
			},
			{
				_type: "block",
				_key: "block-202",
				style: "h2",
				children: [
					{
						_type: "span",
						_key: "span-202",
						text: "Why shadcn over other libraries",
						marks: [],
					},
				],
			},
		],
		coverImage: {
			_type: "image",
			alt: "Tailwind CSS design tokens",
			url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
			hotspot: { x: 0.5, y: 0.3, height: 0.6, width: 0.9 },
		},
		publishedAt: "2023-09-28T00:00:00Z",
		readingTime: 6,
		tags: ["Design", "TypeScript"],
		locale: "en",
		titleLocales: {
			en: "Crafting a Design System with Tailwind and shadcn/ui",
			zh: "使用 Tailwind 和 shadcn/ui 构建设计系统",
		},
		category: {
			_id: "cat-003",
			title: "Design",
			slug: "design",
		},
		author: {
			_id: "author-001",
			name: "Your Name",
			avatar: {
				_type: "image",
				alt: "Your Name avatar",
				url: "https://api.dicebear.com/7.x/avataaars/svg?seed=yourname",
			},
		},
	},
	{
		_id: "post-004",
		slug: "mbti-scoring-engine-typescript",
		title: "Implementing a Client-Side MBTI Scoring Engine",
		excerpt:
			"Building a zero-latency personality test with pure TypeScript — scoring logic, result mapping, and shareable OG cards.",
		body: [
			{
				_type: "block",
				_key: "block-301",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "span-301",
						text: "The MBTI test is one of the most fun features on this platform. All scoring happens client-side with no network requests during the test.",
						marks: [],
					},
				],
			},
		],
		coverImage: {
			_type: "image",
			alt: "Personality type chart",
			url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
		},
		publishedAt: "2022-11-15T00:00:00Z",
		readingTime: 12,
		tags: ["TypeScript", "Design"],
		locale: "en",
		titleLocales: {
			en: "Implementing a Client-Side MBTI Scoring Engine",
			zh: "实现客户端 MBTI 评分引擎",
		},
		category: {
			_id: "cat-001",
			title: "Engineering",
			slug: "engineering",
		},
		author: {
			_id: "author-001",
			name: "Your Name",
			avatar: {
				_type: "image",
				alt: "Your Name avatar",
				url: "https://api.dicebear.com/7.x/avataaars/svg?seed=yourname",
			},
		},
	},
	{
		_id: "post-005",
		slug: "cloudflare-vercel-deployment",
		title: "Cloudflare + Vercel: The Perfect Global Deployment Stack",
		excerpt:
			"Configuring Cloudflare DNS, caching rules, and Turnstile CAPTCHA to work seamlessly with a Vercel-hosted Next.js app.",
		body: [
			{
				_type: "block",
				_key: "block-401",
				style: "normal",
				children: [
					{
						_type: "span",
						_key: "span-401",
						text: "Combining Cloudflare's global edge network with Vercel's deployment platform gives you the best of both worlds.",
						marks: [],
					},
				],
			},
		],
		coverImage: {
			_type: "image",
			alt: "Global network map",
			url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
		},
		publishedAt: "2021-07-05T00:00:00Z",
		readingTime: 7,
		tags: ["Next.js", "i18n"],
		locale: "en",
		titleLocales: {
			en: "Cloudflare + Vercel: The Perfect Global Deployment Stack",
			zh: "Cloudflare + Vercel：完美的全球部署方案",
		},
		category: {
			_id: "cat-001",
			title: "Engineering",
			slug: "engineering",
		},
		author: {
			_id: "author-001",
			name: "Your Name",
			avatar: {
				_type: "image",
				alt: "Your Name avatar",
				url: "https://api.dicebear.com/7.x/avataaars/svg?seed=yourname",
			},
		},
	},
];
