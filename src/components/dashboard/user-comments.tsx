"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Heart, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";

type UserComment = {
	id: string;
	article_key: string;
	author_name: string;
	avatar_url: string;
	content: string;
	status: "published" | "quarantine" | "spam" | "blocked";
	created_at: string;
	parent_id: string | null;
	like_count: number;
};

const statusVariants: Record<
	UserComment["status"],
	"default" | "secondary" | "destructive" | "outline"
> = {
	published: "default",
	quarantine: "secondary",
	spam: "destructive",
	blocked: "outline",
};

function getBlogHref(articleKey: string, locale: string): string {
	if (articleKey.startsWith("blog:")) {
		return `/${locale}/blog/${articleKey.slice(5)}#comments`;
	}
	return "#";
}

function getArticleSlug(articleKey: string): string {
	if (articleKey.startsWith("blog:")) {
		return articleKey.slice(5);
	}
	return articleKey;
}



export default function UserComments() {
	const t = useTranslations("dashboard.comments");
	const locale = useLocale();
	const [comments, setComments] = useState<UserComment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const loadComments = async () => {
		setIsLoading(true);
		setLoadError(null);
		try {
			const res = await fetch("/api/comments/mine", { cache: "no-store" });
			if (!res.ok) throw new Error(t("myCommentsLoadError"));
			const payload = await res.json();
			setComments(payload.comments ?? []);
		} catch (err) {
			setLoadError(
				err instanceof Error ? err.message : t("myCommentsLoadError"),
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		void loadComments();
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("myCommentsTitle")}</CardTitle>
				<CardDescription>{t("myCommentsDescription")}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{isLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, idx) => (
							<Skeleton key={idx} className="h-20 w-full rounded-lg" />
						))}
					</div>
				) : loadError ? (
					<ErrorState
						title={t("myCommentsTitle")}
						description={loadError}
						onRetry={() => void loadComments()}
						retryLabel={t("actions.retry")}
					/>
				) : comments.length === 0 ? (
					<p className="py-6 text-center text-sm text-muted-foreground">
						{t("myCommentsEmpty")}
					</p>
				) : (
					comments.map((comment) => (
						<div
							key={comment.id}
							className="rounded-lg border border-border/60 px-4 py-3"
						>
							<div className="flex gap-3">
								<div className="min-w-0 flex-1 space-y-1.5">
									<div className="flex flex-wrap items-center gap-2">
										<Link
											href={getBlogHref(comment.article_key, locale)}
											className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
										>
											{getArticleSlug(comment.article_key)}
										</Link>
										{comment.parent_id ? (
											<Badge variant="outline" className="gap-1 text-[10px]">
												<MessageSquare className="size-2.5" />
												{t("replyLabel")}
											</Badge>
										) : null}
										<Badge
											variant={statusVariants[comment.status]}
											className="text-[10px]"
										>
											{comment.status}
										</Badge>
										<span className="ml-auto text-xs text-muted-foreground">
											{new Date(comment.created_at).toLocaleString()}
										</span>
									</div>
									<p className="line-clamp-2 text-sm text-foreground/80">
										{comment.content}
									</p>
									{comment.like_count > 0 ? (
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<Heart className="size-3 fill-red-500 text-red-500" />
											{t("likeCount", { count: comment.like_count })}
										</div>
									) : null}
								</div>
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
