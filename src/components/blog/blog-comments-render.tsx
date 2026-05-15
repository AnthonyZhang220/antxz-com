"use client";

import { Fragment } from "react";
import { CommentItem, TreeCommentItem } from "@/lib/actions/comments";

export const renderInline = (input: string) => {
	const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
	const parts = input.split(tokenRegex).filter(Boolean);

	return parts.map((part, idx) => {
		if (part.startsWith("**") && part.endsWith("**")) {
			return (
				<strong key={idx} className="font-semibold text-foreground">
					{part.slice(2, -2)}
				</strong>
			);
		}
		if (part.startsWith("*") && part.endsWith("*")) {
			return (
				<em key={idx} className="italic">
					{part.slice(1, -1)}
				</em>
			);
		}
		if (part.startsWith("`") && part.endsWith("`")) {
			return (
				<code
					key={idx}
					className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
				>
					{part.slice(1, -1)}
				</code>
			);
		}
		return <Fragment key={idx}>{part}</Fragment>;
	});
};
export const renderCommentContent = (content: string) => {
	return content.split("\n").map((line, idx) => (
		<p key={idx} className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
			{line.length === 0 ? (
				<span className="inline-block h-4" />
			) : (
				renderInline(line)
			)}
		</p>
	));
};

export const getInitials = (name: string) => {
	const tokens = name.trim().split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return "U";
	return (
		tokens
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? "")
			.join("") || "U"
	);
};

export function buildTree(comments: CommentItem[]): TreeCommentItem[] {
	const map = new Map<string, TreeCommentItem>();
	for (const c of comments) {
		map.set(c.id, { ...c, replies: [] });
	}
	const roots: TreeCommentItem[] = [];
	for (const c of map.values()) {
		if (c.parent_id && map.has(c.parent_id)) {
			map.get(c.parent_id)!.replies.push(c);
		} else {
			roots.push(c);
		}
	}
	return roots;
}
