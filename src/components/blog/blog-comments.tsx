"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
	submitComment as submitCommentAction,
	deleteComment as deleteCommentAction,
	likeComment as likeCommentAction,
	unlikeComment as unlikeCommentAction,
} from "@/lib/actions/comments";
import { getActionErrorMessage } from "@/lib/errors/action-error";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Bold,
	Code,
	Heart,
	Italic,
	LogIn,
	Trash2,
	AlertCircle,
	MessageCircleMore,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User } from "@supabase/supabase-js";
import {
	renderCommentContent,
	getInitials,
	buildTree,
} from "./blog-comments-render";
import { getCommentErrorMessageKey } from "@/lib/i18n/comment-labels";
import { CommentItem } from "@/lib/actions/comments";

export type ErrorState = {
	message: string | null;
	reasons: string[];
};
export interface BlogCommentsProps {
	articleKey: string;
	initialUser: User | null;
	initialComments: CommentItem[];
}

export default function BlogComments({
	articleKey,
	initialUser,
	initialComments,
}: BlogCommentsProps) {
	const t = useTranslations("blog");
	const locale = useLocale();
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	//comments state
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [comments, setComments] = useState<CommentItem[]>(initialComments);
	const commentTree = useMemo(() => buildTree(comments), [comments]);

	const [message, setMessage] = useState("");
	const [replyMessage, setReplyMessage] = useState("");
	const [replyingToId, setReplyingToId] = useState<string | null>(null);
	const [replyingToName, setReplyingToName] = useState("");

	//error and notice state
	const [mainError, setMainError] = useState<ErrorState>({
		message: null,
		reasons: [],
	});
	const [replyError, setReplyError] = useState<ErrorState>({
		message: null,
		reasons: [],
	});
	const [likingId, setLikingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [deleteDialogCommentId, setDeleteDialogCommentId] = useState<
		string | null
	>(null);

	const currentUserProfile = useMemo(() => {
		if (!initialUser) return null;
		return {
			avatar_url: String(
				initialUser.user_metadata?.avatar_url ||
					initialUser.user_metadata?.picture ||
					"",
			),
			display_name: String(
				initialUser.user_metadata?.full_name ||
					initialUser.user_metadata?.name ||
					initialUser.email ||
					"User",
			),
		};
	}, [initialUser]);

	//user state
	const isLoggedIn = !!initialUser;
	const currentUserId = initialUser?.id ?? null;

	const applyWrap = (prefix: string, suffix = prefix) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selected = message.slice(start, end);
		const next = `${message.slice(0, start)}${prefix}${selected}${suffix}${message.slice(end)}`;
		setMessage(next);

		requestAnimationFrame(() => {
			const cursorStart = start + prefix.length;
			const cursorEnd = cursorStart + selected.length;
			textarea.focus();
			textarea.setSelectionRange(cursorStart, cursorEnd);
		});
	};

	// 1. 提交评论
	const submitComment = async (content: string, parentId?: string) => {
		setIsSubmitting(true);

		const setError = parentId ? setReplyError : setMainError;
		setError({ message: null, reasons: [] });

		try {
			const result = await submitCommentAction(articleKey, content, parentId);
			if (!result.ok) {
				setError({
					message: result.message,
					reasons: result.reasons ?? [],
				});
				return;
			}

			if (result.comment) {
				const newComment: CommentItem = {
					...result.comment,
					parent_id: parentId ?? null,
					user_id: currentUserId ?? result.comment.user_id,
					author_name: currentUserProfile?.display_name ?? "Anonymous",
					avatar_url: currentUserProfile?.avatar_url ?? "",
					user_liked: false,
					like_count: 0,
					likers: [],
				};

				setComments((prev) => [newComment, ...prev]);
			}

			if (parentId) {
				setReplyMessage("");
				setReplyingToId(null);
			} else {
				setMessage("");
			}
		} catch (err) {
			const message = getActionErrorMessage(err, t("commentsSubmitError"));
			if (parentId) {
				setReplyError({ message, reasons: [] });
			} else {
				setMainError({ message, reasons: [] });
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const onDeleteComment = async (commentId: string) => {
		if (!isLoggedIn) {
			setMainError({ message: t("commentsLoginRequired"), reasons: [] });
			return;
		}

		const previousComment = [...comments];
		setComments((prev) => prev.filter((comment) => comment.id !== commentId));
		setDeletingId(commentId);
		setMainError({ message: null, reasons: [] });

		try {
			await deleteCommentAction(commentId);

			if (replyingToId === commentId) {
				setReplyingToId(null);
				setReplyingToName("");
				setReplyMessage("");
			}
		} catch (err) {
			// Revert optimistic update
			setComments(previousComment);
			setMainError({
				message: getActionErrorMessage(err, t("commentsDeleteError")),
				reasons: [],
			});
		} finally {
			setDeletingId(null);
		}
	};

	const onSubmit = () => message.trim() && void submitComment(message.trim());
	const onSubmitReply = (parentId: string) =>
		replyMessage.trim() && void submitComment(replyMessage.trim(), parentId);

	const onStartReply = (comment: CommentItem) => {
		setReplyError({ message: null, reasons: [] });
		if (replyingToId === comment.id) {
			setReplyingToId(null);
			setReplyingToName("");
			setReplyMessage("");
		} else {
			setReplyingToId(comment.id);
			setReplyingToName(comment.author_name || "User");
			setReplyMessage("");
		}
	};

	const onToggleLike = async (commentId: string, liked: boolean) => {
		if (!isLoggedIn) {
			setMainError({ message: t("commentsLoginRequired"), reasons: [] });
			return;
		}

		setLikingId(commentId);
		setComments((prev) =>
			prev.map((comment) =>
				comment.id === commentId
					? {
							...comment,
							user_liked: !liked,
							like_count: Math.max(0, comment.like_count + (liked ? -1 : 1)),
						}
					: comment,
			),
		);

		setMainError({ message: null, reasons: [] });

		try {
			if (liked) {
				await unlikeCommentAction(commentId);
			} else {
				await likeCommentAction(commentId);
			}
		} catch (err) {
			setComments((prev) =>
				prev.map((comment) =>
					comment.id === commentId
						? {
								...comment,
								user_liked: liked,
								like_count: Math.max(0, comment.like_count + (liked ? 1 : -1)),
							}
						: comment,
				),
			);
			setMainError({
				message: getActionErrorMessage(err, t("commentsLikeError")),
				reasons: [],
			});
		} finally {
			setLikingId(null);
		}
	};

	const textareaClass =
		"border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] md:text-sm";

	const renderLikeActions = (comment: CommentItem, showReply: boolean) => (
		<div className="flex flex-wrap items-center gap-0.5 pt-2">
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => void onToggleLike(comment.id, comment.user_liked)}
				disabled={likingId === comment.id}
				className={
					comment.user_liked
						? "icon-jiggle-group h-8 px-2 text-foreground hover:text-foreground"
						: "icon-jiggle-group h-8 px-2 text-muted-foreground hover:text-foreground"
				}
			>
				<span className="flex items-center gap-1">
					<Heart
						className={
							comment.user_liked
								? "icon-jiggle-once mr-1 h-4 w-4 fill-current text-red-500"
								: "icon-jiggle-once mr-1 h-4 w-4"
						}
					/>
					{comment.like_count}
					{comment.likers && comment.likers.length > 0 && (
						<div className="mr-1 flex items-center -space-x-1.5">
							<Separator orientation="vertical" className="mx-1 h-4" />
							<AvatarGroup>
								{comment.likers.map((liker) => (
									<Avatar
										key={liker.user_id}
										className="h-5 w-5"
										title={liker.author_name}
									>
										<AvatarImage
											src={liker.avatar_url}
											alt={liker.author_name}
										/>
										<AvatarFallback className="bg-muted text-[8px] font-semibold">
											{getInitials(liker.author_name)}
										</AvatarFallback>
									</Avatar>
								))}
							</AvatarGroup>
						</div>
					)}
				</span>
			</Button>
			{showReply && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => onStartReply(comment)}
					className={`icon-jiggle-group h-8 px-2 ${replyingToId === comment.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
				>
					<MessageCircleMore className="icon-jiggle-once mr-1 h-4 w-4" />
					{replyingToId === comment.id
						? t("commentsCancel")
						: t("commentsReply")}
				</Button>
			)}
			{comment.user_id === currentUserId && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => setDeleteDialogCommentId(comment.id)}
					disabled={deletingId === comment.id}
					className="icon-jiggle-group h-8 px-2 text-muted-foreground hover:text-destructive"
				>
					<Trash2 className="icon-jiggle-once h-4 w-4" />
				</Button>
			)}
		</div>
	);

	const renderReplyForm = (parentId: string) => (
		<div className="mt-3 space-y-2 border-l-2 border-border pl-3">
			<p className="text-xs text-muted-foreground">
				{t("commentsReplyTo", { name: replyingToName })}
			</p>
			<textarea
				placeholder={t("commentsReplyPlaceholder")}
				value={replyMessage}
				onChange={(e) => setReplyMessage(e.target.value)}
				rows={3}
				disabled={!isLoggedIn || isSubmitting}
				className={textareaClass}
			/>
			{replyError && replyError.reasons.length > 0 && (
				<Alert variant="destructive" className="text-sm">
					<AlertCircle className="h-4 w-4" />
					<div className="flex-1">
						<AlertTitle className="text-sm">{replyError.message}</AlertTitle>
						{replyError.reasons.length > 0 && (
							<AlertDescription className="mt-1.5 text-xs text-destructive">
								<ul className="list-inside list-disc space-y-0.5">
									{replyError.reasons.map((reason) => (
										<li key={reason}>{t(getCommentErrorMessageKey(reason))}</li>
									))}
								</ul>
							</AlertDescription>
						)}
					</div>
				</Alert>
			)}
			<div className="flex gap-2">
				<Button
					type="button"
					size="sm"
					onClick={() => void onSubmitReply(parentId)}
					disabled={!isLoggedIn || isSubmitting || !replyMessage.trim()}
				>
					{isSubmitting ? t("commentsSubmitting") : t("commentsSubmit")}
				</Button>
				<Button
					type="button"
					size="sm"
					variant="ghost"
					onClick={() => {
						setReplyingToId(null);
						setReplyMessage("");
						setReplyError({ message: null, reasons: [] });
					}}
				>
					{t("commentsCancel")}
				</Button>
			</div>
		</div>
	);

	return (
		<section className="mt-12 pb-24">
			<Card className="border-border/70 bg-card/85 backdrop-blur-sm">
				<CardHeader>
					<CardTitle className="font-serif text-2xl text-foreground">
						{t("commentsTitle")}
					</CardTitle>
					<CardDescription>{t("commentsDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-muted/20 p-2">
						<Toggle
							size="sm"
							onPressedChange={() => applyWrap("**")}
							disabled={!isLoggedIn || isSubmitting}
							aria-label={t("commentsFormatBold")}
						>
							<Bold className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							onPressedChange={() => applyWrap("*")}
							disabled={!isLoggedIn || isSubmitting}
							aria-label={t("commentsFormatItalic")}
						>
							<Italic className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							onPressedChange={() => applyWrap("`")}
							disabled={!isLoggedIn || isSubmitting}
							aria-label={t("commentsFormatCode")}
						>
							<Code className="h-4 w-4" />
						</Toggle>
						<span className="ml-1 text-xs text-muted-foreground">
							{t("commentsFormattingHint")}
						</span>
					</div>

					<textarea
						ref={textareaRef}
						placeholder={t("commentsMessagePlaceholder")}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						rows={5}
						disabled={!isLoggedIn || isSubmitting}
						className={textareaClass}
					/>

					{!isLoggedIn && (
						<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-2">
							<p className="text-sm text-muted-foreground">
								{t("commentsLoginRequired")}
							</p>
							<Button asChild size="sm" variant="outline">
								<Link href={`/${locale}/auth/login`}>
									<LogIn className="mr-1.5 h-4 w-4" />
									{t("commentsLoginCta")}
								</Link>
							</Button>
						</div>
					)}
					{mainError && mainError.reasons.length > 0 && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<div className="flex-1">
								<AlertTitle>{mainError.message}</AlertTitle>
								{mainError.reasons.length > 0 && (
									<AlertDescription className="mt-2 text-destructive">
										<ul className="list-inside list-disc space-y-1">
											{mainError.reasons.map((reason) => (
												<li key={reason} className="text-xs">
													{t(getCommentErrorMessageKey(reason))}
												</li>
											))}
										</ul>
									</AlertDescription>
								)}
							</div>
						</Alert>
					)}

					<div className="flex justify-end">
						<Button
							type="button"
							onClick={onSubmit}
							disabled={!isLoggedIn || isSubmitting || !message.trim()}
						>
							{isSubmitting ? t("commentsSubmitting") : t("commentsSubmit")}
						</Button>
					</div>

					<Separator className="my-2" />

					<div className="space-y-3">
						<p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground/80">
							{t("commentsCount", { count: comments.length })}
						</p>
						{isLoading && (
							<p className="text-sm text-muted-foreground">
								{t("commentsLoading")}
							</p>
						)}
						{!isLoading && comments.length === 0 && (
							<p className="text-sm text-muted-foreground">
								{t("commentsEmpty")}
							</p>
						)}
						{commentTree.map((comment) => (
							<article key={comment.id}>
								<div className="rounded-lg border border-border/60 px-4 py-3">
									<div className="flex gap-3">
										<Avatar className="mt-0.5 h-9 w-9 shrink-0">
											{comment.avatar_url ? (
												<AvatarImage
													src={comment.avatar_url}
													alt={comment.author_name || "User"}
												/>
											) : null}
											<AvatarFallback className="text-xs font-semibold">
												{getInitials(comment.author_name || "User")}
											</AvatarFallback>
										</Avatar>
										<div className="min-w-0 flex-1">
											<div className="mb-1 flex items-center justify-between gap-3">
												<span className="text-sm font-semibold text-foreground">
													{comment.author_name || "User"}
												</span>
												<span className="text-xs text-muted-foreground">
													{new Date(comment.created_at).toLocaleString()}
												</span>
											</div>
											<div className="space-y-1">
												{comment.status === "quarantine" ? (
													<p className="text-xs text-amber-600 dark:text-amber-400">
														{t("commentsVisibleOnlyToYou")}
													</p>
												) : null}
												{renderCommentContent(comment.content)}
												{renderLikeActions(comment, true)}
											</div>
										</div>
									</div>
									{replyingToId === comment.id && renderReplyForm(comment.id)}
								</div>

								{comment.replies.length > 0 && (
									<div className="ml-6 mt-2 space-y-2 border-l-2 border-border/30 pl-4">
										{comment.replies.map((reply) => (
											<article
												key={reply.id}
												className="rounded-lg border border-border/40 bg-muted/10 px-4 py-3"
											>
												<div className="flex gap-3">
													<Avatar className="mt-0.5 h-7 w-7 shrink-0">
														{reply.avatar_url ? (
															<AvatarImage
																src={reply.avatar_url}
																alt={reply.author_name || "User"}
															/>
														) : null}
														<AvatarFallback className="text-[10px] font-semibold">
															{getInitials(reply.author_name || "User")}
														</AvatarFallback>
													</Avatar>
													<div className="min-w-0 flex-1">
														<div className="mb-1 flex items-center justify-between gap-3">
															<span className="text-sm font-semibold text-foreground">
																{reply.author_name || "User"}
															</span>
															<span className="text-xs text-muted-foreground">
																{new Date(reply.created_at).toLocaleString()}
															</span>
														</div>
														<div className="space-y-1">
															{reply.status === "quarantine" ? (
																<p className="text-xs text-amber-600 dark:text-amber-400">
																	{t("commentsVisibleOnlyToYou")}
																</p>
															) : null}
															{renderCommentContent(reply.content)}
															{renderLikeActions(reply, false)}
														</div>
													</div>
												</div>
											</article>
										))}
									</div>
								)}
							</article>
						))}
					</div>
				</CardContent>
			</Card>
			<AlertDialog
				open={deleteDialogCommentId !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteDialogCommentId(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("commentsDelete")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("commentsDeleteConfirm")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("commentsCancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (!deleteDialogCommentId) return;
								void onDeleteComment(deleteDialogCommentId);
								setDeleteDialogCommentId(null);
							}}
						>
							{t("commentsDelete")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}
