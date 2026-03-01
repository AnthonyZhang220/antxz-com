import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BlogPost } from "@/types/blog";

// Helper used for the "reading time" section. Copied from blog-list.tsx
const READ_DEFS = [
	{ key: "short", label: "< 5 min", test: (r: number) => r < 5 },
	{ key: "medium", label: "5–10 min", test: (r: number) => r >= 5 && r <= 10 },
	{ key: "long", label: "> 10 min", test: (r: number) => r > 10 },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="font-mono text-xs md:text-sm uppercase tracking-[0.14em] text-muted-foreground/70 mb-2.5">
			{children}
		</p>
	);
}

interface BlogFilterProps {
	posts: BlogPost[];
	tag: string | null;
	setTag: React.Dispatch<React.SetStateAction<string | null>>;
	allTags: string[];
	tagCounts: Record<string, number>;
	yearRange: [number, number];
	setYearRange: React.Dispatch<React.SetStateAction<[number, number]>>;
	minYear: number;
	maxYear: number;
	allYears: number[];
	readTime: string | null;
	setReadTime: React.Dispatch<React.SetStateAction<string | null>>;
	isDefault: boolean;
	clearAll: () => void;
	go: (fn: () => void) => void;
}

export default function BlogFilter({
	posts,
	tag,
	setTag,
	allTags,
	tagCounts,
	yearRange,
	setYearRange,
	minYear,
	maxYear,
	allYears,
	readTime,
	setReadTime,
	isDefault,
	clearAll,
	go,
}: BlogFilterProps) {
	const t = useTranslations("blog");

	return (
		<aside className="w-48 shrink-0 sticky top-6 flex flex-col gap-5">
			{/* Topic */}
			<div>
				<SectionLabel>{t("filterTopic")}</SectionLabel>
				<div className="flex flex-col gap-0.5">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => go(() => setTag(null))}
						className={cn(
							"w-full justify-between font-normal text-sm h-8 px-2.5 rounded-lg",
							!tag
								? "bg-foreground text-background hover:bg-foreground hover:text-background"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<span>{t("filterAll")}</span>
						<span className="font-mono text-xs md:text-sm opacity-70">
							{posts.length}
						</span>
					</Button>

					{allTags.map((t) => (
						<Button
							key={t}
							variant="ghost"
							size="sm"
							onClick={() => go(() => setTag(tag === t ? null : t))}
							className={cn(
								"w-full justify-between font-normal text-sm h-8 px-2.5 rounded-lg",
								tag === t
									? "bg-foreground text-background hover:bg-foreground hover:text-background"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<span>{t}</span>
							<span className="font-mono text-xs md:text-sm opacity-55">
								{tagCounts[t]}
							</span>
						</Button>
					))}
				</div>
			</div>

			<Separator />

			{/* Year Range */}
			<div>
				<SectionLabel>{t("filterYear")}</SectionLabel>

				<div className="flex justify-between mb-3">
					{yearRange.map((y, i) => (
						<span
							key={i}
							className="font-mono text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md"
						>
							{y}
						</span>
					))}
				</div>

				{/*
                shadcn Slider accepts value={[min, max]} for range mode.
                Make sure your installed Slider supports the `value` array prop.
                If not, run: npx shadcn@latest add slider
              */}
				<Slider
					min={minYear}
					max={maxYear}
					step={1}
					value={yearRange}
					onValueChange={(v) => go(() => setYearRange(v as [number, number]))}
					className="w-full"
				/>

				{/* Tick marks */}
				<div className="flex justify-between mt-2.5">
					{allYears.map((y) => (
						<span
							key={y}
							className={cn(
								"font-mono text-xs transition-colors duration-150",
								y >= yearRange[0] && y <= yearRange[1]
									? "text-muted-foreground"
									: "text-muted-foreground/30",
							)}
						>
							{y}
						</span>
					))}
				</div>
			</div>

			<Separator />

			{/* Reading time */}
			<div>
				<SectionLabel>{t("filterReadingTime")}</SectionLabel>
				<div className="flex flex-col gap-1.5">
					{READ_DEFS.map(({ key, label }) => (
						<Toggle
							key={key}
							pressed={readTime === key}
							onPressedChange={() =>
								go(() => setReadTime(readTime === key ? null : key))
							}
							size="sm"
							className={cn(
								"w-full justify-start font-mono text-xs md:text-sm h-8 px-3 rounded-lg",
								"border border-border",
								"data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:border-foreground",
								"hover:bg-background hover:text-foreground hover:border-border",
							)}
						>
							{label}
						</Toggle>
					))}
				</div>
			</div>

			{/* Clear all */}
			{!isDefault && (
				<>
					<Separator />
					<Button
						variant="outline"
						size="sm"
						onClick={clearAll}
						className="w-full font-mono text-xs md:text-sm text-muted-foreground/70 hover:text-foreground"
					>
						{t("clearFilters")}
					</Button>
				</>
			)}
		</aside>
	);
}
