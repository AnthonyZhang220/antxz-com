"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { handleError, handleSuccess } from "@/lib/error-utils";

type AdminComment = {
	id: string;
	article_key: string;
	user_id: string;
	author_name: string;
	avatar_url: string;
	content: string;
	status: "published" | "quarantine" | "spam" | "blocked";
	created_at: string;
};

const statusVariants: Record<AdminComment["status"], "secondary" | "destructive" | "outline" | "default"> = {
	published: "default",
	quarantine: "secondary",
	spam: "destructive",
	blocked: "outline",
};

export default function CommentModeration() {
	const t = useTranslations("dashboard.comments");
	const updateErrorMessage = t("messages.updateError");
	const updateSuccessMessage = t("messages.updateSuccess");
	const [comments, setComments] = useState<AdminComment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isForbidden, setIsForbidden] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [pendingAction, setPendingAction] = useState<string | null>(null);

	const loadComments = async () => {
		setIsLoading(true);
		setLoadError(null);
		try {
			const response = await fetch("/api/comments/admin", { cache: "no-store" });
			if (response.status === 403) {
				setIsForbidden(true);
				setComments([]);
				return;
			}

			if (!response.ok) {
				throw new Error(t("messages.loadError"));
			}

			const payload = await response.json();
			setIsForbidden(false);
			setComments(payload.comments ?? []);
		} catch (error) {
			setLoadError(error instanceof Error ? error.message : t("messages.loadError"));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		void loadComments();
	}, []);

	const runAction = async (payload: Record<string, string>) => {
		const key = `${payload.action}:${payload.commentId || payload.userId || ""}`;
		setPendingAction(key);
		try {
			const response = await fetch("/api/comments/admin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error(updateErrorMessage);
			}

			handleSuccess(updateSuccessMessage);
			await loadComments();
		} catch (error) {
			handleError(error, updateErrorMessage);
		} finally {
			setPendingAction(null);
		}
	};

	return (
		<div className="p-4 lg:p-6">
			{isLoading ? <DashboardPageSkeleton rows={3} /> : null}
			{!isLoading && !isForbidden && loadError ? (
				<ErrorState
					title={t("safeguardsTitle")}
					description={loadError}
					onRetry={() => void loadComments()}
					retryLabel={t("actions.retry")}
					className="mb-4"
				/>
			) : null}

			{isLoading || (loadError && !isForbidden) ? null : (
				<Card>
					<CardHeader>
						<CardTitle>{t("safeguardsTitle")}</CardTitle>
						<CardDescription>
							{t("safeguardsDescription")}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{isForbidden ? (
							<p className="text-sm text-muted-foreground">
								Admin access is limited to emails listed in COMMENT_ADMIN_EMAILS.
							</p>
						) : null}
						{!isForbidden && comments.length === 0 ? (
							<p className="text-sm text-muted-foreground">No quarantined or spam comments right now.</p>
						) : null}
						{comments.map((comment) => (
							<div key={comment.id} className="rounded-lg border p-4">
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="space-y-2">
										<div className="flex flex-wrap items-center gap-2">
											<Badge variant={statusVariants[comment.status]}>{comment.status}</Badge>
											<span className="text-sm font-medium">{comment.author_name}</span>
											<span className="text-xs text-muted-foreground">{comment.article_key}</span>
										</div>
										<p className="text-sm text-muted-foreground">{comment.content}</p>
										<p className="text-xs text-muted-foreground">
											{new Date(comment.created_at).toLocaleString()}
										</p>
									</div>
									<div className="flex flex-wrap gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => void runAction({ action: "set-status", commentId: comment.id, status: "published" })}
											disabled={pendingAction === `set-status:${comment.id}`}
										>
											Publish
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => void runAction({ action: "block-user", userId: comment.user_id })}
											disabled={pendingAction === `block-user:${comment.user_id}`}
										>
											Block user
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => void runAction({ action: "delete-comment", commentId: comment.id })}
											disabled={pendingAction === `delete-comment:${comment.id}`}
										>
											Delete
										</Button>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
