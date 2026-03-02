import { useState, useMemo } from "react";
import { BlogPost } from "@/types/blog";

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
	const [tag, setTag] = useState<string | null>(null);
	const [yearRange, setYearRange] = useState<[number, number]>([minYear, maxYear]);
	const [readTime, setReadTime] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	const go = (fn: () => void) => {
		fn();
		setPage(1);
	};

	const filtered = useMemo(
		() =>
			posts.filter((p: BlogPost) => {
				const y = getYear(p.publishedAt);
				if (tag && !p.tags.includes(tag)) return false;
				if (y < yearRange[0] || y > yearRange[1]) return false;
				if (readTime) {
					const def = READ_DEFS.find((d) => d.key === readTime);
					if (def && !def.test(p.readingTime)) return false;
				}
				return true;
			}),
		[posts, tag, yearRange, readTime],
	);

	const isDefault =
		!tag &&
		yearRange[0] === minYear &&
		yearRange[1] === maxYear &&
		!readTime;

	const tagCounts = Object.fromEntries(
		posts.map((p) => p.tags).flat().reduce((map, t) => map.set(t, (map.get(t) || 0) + 1), new Map<string, number>()),
	);

	const allYears = [...new Set(posts.map((p) => getYear(p.publishedAt)))].sort((a, b) => a - b);

	return {
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
		clearAll: () => {
			setTag(null);
			setYearRange([minYear, maxYear]);
			setReadTime(null);
			setPage(1);
		},
		tagCounts,
		allYears,
	};
}
