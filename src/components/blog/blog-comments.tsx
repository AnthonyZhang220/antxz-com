"use client";

import Link from "next/link";
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
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
	MessageSquare,
	Trash2,
	AlertCircle,
} from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";

interface LikerInfo {
	user_id: string;
	avatar_url: string;
	author_name: string;
}

interface CommentItem {
	id: string;
	article_key: string;
	user_id: string;
	author_name: string;
	avatar_url: string;
	content: string;
	created_at: string;
	status?: "published" | "quarantine" | "spam" | "blocked";
	parent_id: string | null;
	like_count: number;
	user_liked: boolean;
	likers: LikerInfo[];
}

interface TreeCommentItem extends CommentItem {
	replies: TreeCommentItem[];
}

interface BlogCommentsProps {
	articleKey: string;
}

function buildTree(comments: CommentItem[]): TreeCommentItem[] {
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

export default function BlogComments({ articleKey }: BlogCommentsProps) {
	const t = useTranslations("blog");
	const locale = useLocale();
	const supabase = useMemo(() => createClient(), []);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [comments, setComments] = useState<CommentItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const commentTree = useMemo(() => buildTree(comments), [comments]);
	const [message, setMessage] = useState("");
	const [replyMessage, setReplyMessage] = useState("");
	const [replyingToId, setReplyingToId] = useState<string | null>(null);
	const [replyingToName, setReplyingToName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [likingId, setLikingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [deleteDialogCommentId, setDeleteDialogCommentId] = useState<
		string | null
	>(null);
	const currentUserProfileRef = useRef<{
		avatar_url: string;
		display_name: string;
	} | null>(null);

	const commentsLoadErrorMessage = t("commentsLoadError");

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

	const renderInline = (input: string) => {
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

	const renderCommentContent = (content: string) => {
		return content.split("\n").map((line, idx) => (
			<p
				key={idx}
				className="text-sm leading-6 text-zinc-700 dark:text-zinc-300"
			>
				{line.length === 0 ? (
					<span className="inline-block h-4" />
				) : (
					renderInline(line)
				)}
			</p>
		));
	};

	const getInitials = (name: string) => {
		const tokens = name.trim().split(/\s+/).filter(Boolean);
		if (tokens.length === 0) return "U";
		return (
			tokens
				.slice(0, 2)
				.map((w) => w[0]?.toUpperCase() ?? "")
				.join("") || "U"
		);
	};

	const loadComments = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		setNotice(null);
		try {
			const response = await fetch(
				`/api/comments?articleKey=${encodeURIComponent(articleKey)}`,
				{ cache: "no-store" },
			);
			if (!response.ok) {
				throw new Error("Failed to load comments");
			}
			const payload = await response.json();
			const freshUserId: string | null = payload.currentUserId ?? null;
			setCurrentUserId(freshUserId);
			const rawComments: CommentItem[] = payload.comments ?? [];
			const profile = currentUserProfileRef.current;
			if (freshUserId && profile) {
				setComments(
					rawComments.map((c) =>
						c.user_id === freshUserId
							? {
									...c,
									author_name: profile.display_name,
									avatar_url: profile.avatar_url,
								}
							: c,
					),
				);
			} else {
				setComments(rawComments);
			}
		} catch {
			setError(commentsLoadErrorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [articleKey, commentsLoadErrorMessage]);

	useEffect(() => {
		let mounted = true;

		const bootstrap = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (mounted) {
				setIsLoggedIn(Boolean(user));
				if (user) {
					currentUserProfileRef.current = {
						avatar_url:
							(user.user_metadata?.avatar_url as string | undefined) ||
							(user.user_metadata?.picture as string | undefined) ||
							"",
						display_name:
							(user.user_metadata?.full_name as string | undefined) ||
							(user.user_metadata?.name as string | undefined) ||
							user.email ||
							"User",
					};
				}
			}
			await loadComments();
		};

		bootstrap();

		return () => {
			mounted = false;
		};
	}, [articleKey, supabase, loadComments]);



	const submitComment = async (content: string, parentId?: string) => {
		setIsSubmitting(true);
		setError(null);
		setNotice(null);
		try {
			await submitCommentAction(articleKey, content, parentId);

			if (parentId) {
				setReplyMessage("");
				setReplyingToId(null);
				setReplyingToName("");
			} else {
				setMessage("");
			}
			await loadComments();
		} catch (err) {
			setError(getActionErrorMessage(err, t("commentsSubmitError")));
		} finally {
			setIsSubmitting(false);
		}
	};

	const onDeleteComment = async (commentId: string) => {
		if (!isLoggedIn) {
			setError(t("commentsLoginRequired"));
			return;
		}

		setDeletingId(commentId);
		setError(null);
		setNotice(null);

		try {
			await deleteCommentAction(commentId);

			if (replyingToId === commentId) {
				setReplyingToId(null);
				setReplyingToName("");
				setReplyMessage("");
			}

			await loadComments();
		} catch (err) {
			setError(getActionErrorMessage(err, t("commentsDeleteError")));
		} finally {
			setDeletingId(null);
		}
	};

	const onSubmit = async () => {
		const content = message.trim();
		if (!content) return;
		await submitComment(content);
	};

	const onSubmitReply = async (parentId: string) => {
		const content = replyMessage.trim();
		if (!content) return;
		await submitComment(content, parentId);
	};

	const onStartReply = (comment: CommentItem) => {
		if (replyingToId === comment.id) {
			setReplyingToId(null);
			setReplyingToName("");
			setReplyMessage("");
			setError(null);
		} else {
			setReplyingToId(comment.id);
			setReplyingToName(comment.author_name || "User");
			setReplyMessage("");
			setError(null);
		}
	};

	const onToggleLike = async (commentId: string, liked: boolean) => {
		if (!isLoggedIn) {
			setError(t("commentsLoginRequired"));
			return;
		}

		setLikingId(commentId);
		setError(null);
		setNotice(null);

		try {
			if (liked) {
				await unlikeCommentAction(commentId);
			} else {
				await likeCommentAction(commentId);
			}

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
		} catch (err) {
			setError(getActionErrorMessage(err, t("commentsLikeError")));
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
					{comment.likers.length > 0 && (
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
					<MessageSquare className="icon-jiggle-once mr-1 h-4 w-4" />
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
			{error && (
				<Alert variant="destructive" className="text-sm">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle className="text-sm">{error}</AlertTitle>
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
						setError(null);
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
					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
						<AlertTitle>{error}</AlertTitle>
						</Alert>
					)}
					{notice && (
						<p className="text-sm text-amber-600 dark:text-amber-400">
							{notice}
						</p>
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
							<div key={comment.id}>
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
											<div
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
											</div>
										))}
									</div>
								)}
							</div>
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
