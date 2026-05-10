import { useState, useMemo } from "react";
import { BlogLanguageType, BlogPost } from "@/types/blog";

const READ_DEFS = [
	{ key: "short", label: "< 5 min", test: (r: number) => r < 5 },
	{ key: "medium", label: "5–10 min", test: (r: number) => r >= 5 && r <= 10 },
	{ key: "long", label: "> 10 min", test: (r: number) => r > 10 },
] as const;

const getYear = (iso: string) => new Date(iso).getFullYear();

export function useBlogFilter(
	posts: BlogPost[],
	minYear: number,
	maxYear: number,
) {
	// filter state
	const [category, setCategory] = useState<string | null>(null);
	const [language, setLanguage] = useState<BlogLanguageType | null>(null);
	const [tag, setTag] = useState<string | null>(null);
	const [yearRange, setYearRange] = useState<[number, number]>([minYear, maxYear]);
	const [readTime, setReadTime] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	const resolveLanguageType = (post: BlogPost): BlogLanguageType => {
		if (post.languageType) return post.languageType;
		if (post.hasEn && post.hasZh) return "bilingual";
		if (post.hasZh) return "zh";
		return "en";
	};

	const go = (fn: () => void) => {
		fn();
		setPage(1);
	};

	const filtered = useMemo(
		() =>
			posts.filter((p: BlogPost) => {
				const y = getYear(p.publishedAt);
				const pLanguage = resolveLanguageType(p);
				if (language && pLanguage !== language) return false;
				if (category && p.category?.title !== category) return false;
				if (tag && !p.tags.includes(tag)) return false;
				if (y < yearRange[0] || y > yearRange[1]) return false;
				if (readTime) {
					const def = READ_DEFS.find((d) => d.key === readTime);
					if (def && !def.test(p.readingTime)) return false;
				}
				return true;
			}),
		[posts, language, category, tag, yearRange, readTime],
	);

	const isDefault =
		!language &&
		!category &&
		!tag &&
		yearRange[0] === minYear &&
		yearRange[1] === maxYear &&
		!readTime;

	const languageCounts = Object.fromEntries(
		posts.reduce(
			(map, post) => {
				const value = resolveLanguageType(post);
				map.set(value, (map.get(value) || 0) + 1);
				return map;
			},
			new Map<BlogLanguageType, number>(),
		),
	) as Record<BlogLanguageType, number>;

	const allLanguages = ["bilingual", "zh", "en"].filter(
		(value) => (languageCounts as Record<string, number>)[value] > 0,
	) as BlogLanguageType[];

	const categoryCounts = Object.fromEntries(
		posts
			.map((p) => p.category?.title)
			.filter((value): value is string => Boolean(value))
			.reduce(
				(map, value) => map.set(value, (map.get(value) || 0) + 1),
				new Map<string, number>(),
			),
	);

	const allCategories = Object.keys(categoryCounts).sort((a, b) =>
		a.localeCompare(b),
	);

	const tagCounts = Object.fromEntries(
		posts.map((p) => p.tags).flat().reduce((map, t) => map.set(t, (map.get(t) || 0) + 1), new Map<string, number>()),
	);

	const allYears = [...new Set(posts.map((p) => getYear(p.publishedAt)))].sort((a, b) => a - b);

	return {
		filtered,
		language,
		setLanguage,
		category,
		setCategory,
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
		clearAll: () => {
			setLanguage(null);
			setCategory(null);
			setTag(null);
			setYearRange([minYear, maxYear]);
			setReadTime(null);
			setPage(1);
		},
		allLanguages,
		languageCounts,
		allCategories,
		categoryCounts,
		tagCounts,
		allYears,
	};
}
