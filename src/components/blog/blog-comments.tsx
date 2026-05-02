"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Code, Heart, Italic, LogIn } from "lucide-react";

interface CommentItem {
	id: string;
	article_key: string;
	author_name: string;
	avatar_url: string;
	content: string;
	created_at: string;
	status?: "published" | "quarantine" | "spam" | "blocked";
	like_count: number;
	user_liked: boolean;
}

interface BlogCommentsProps {
	articleKey: string;
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
	const [message, setMessage] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [likingId, setLikingId] = useState<string | null>(null);

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
				return <strong key={idx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
			}
			if (part.startsWith("*") && part.endsWith("*")) {
				return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
			}
			if (part.startsWith("`") && part.endsWith("`")) {
				return (
					<code key={idx} className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
						{part.slice(1, -1)}
					</code>
				);
			}
			return <Fragment key={idx}>{part}</Fragment>;
		});
	};

	const renderCommentContent = (content: string) => {
		return content.split("\n").map((line, idx) => (
			<p key={idx} className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
				{line.length === 0 ? <span className="inline-block h-4" /> : renderInline(line)}
			</p>
		));
	};

	const getInitials = (name: string) => {
		const tokens = name.trim().split(/\s+/).filter(Boolean);
		if (tokens.length === 0) return "U";
		return tokens.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "U";
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
			setComments(payload.comments ?? []);
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
			}
			await loadComments();
		};

		bootstrap();

		return () => {
			mounted = false;
		};
	}, [articleKey, supabase, loadComments]);

	const onSubmit = async () => {
		const content = message.trim();
		if (!content) return;

		setIsSubmitting(true);
		setError(null);
		setNotice(null);
		try {
			const response = await fetch("/api/comments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ articleKey, content }),
			});

			if (response.status === 401) {
				setError(t("commentsLoginRequired"));
				return;
			}

			if (!response.ok) {
				throw new Error("Failed to post comment");
			}

			const payload = await response.json();
			const status = payload?.moderation?.status as CommentItem["status"] | undefined;
			if (status === "quarantine") {
				setNotice(t("commentsQuarantined"));
			} else if (status === "spam" || status === "blocked") {
				setNotice(t("commentsHiddenBySafety"));
			}

			setMessage("");
			await loadComments();
		} catch {
			setError(t("commentsSubmitError"));
		} finally {
			setIsSubmitting(false);
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
			const response = await fetch("/api/comments/likes", {
				method: liked ? "DELETE" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ commentId }),
			});

			if (!response.ok) {
				throw new Error("Failed to toggle like");
			}

			setComments((prev) =>
				prev.map((comment) =>
					comment.id === commentId
						? {
							...comment,
							user_liked: !liked,
							like_count: Math.max(0, comment.like_count + (liked ? -1 : 1)),
						}
						: comment
				)
			);
		} catch {
			setError(t("commentsLikeError"));
		} finally {
			setLikingId(null);
		}
	};

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
						className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] md:text-sm"
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
					{error && <p className="text-sm text-red-500">{error}</p>}
					{notice && <p className="text-sm text-amber-600 dark:text-amber-400">{notice}</p>}

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
							<p className="text-sm text-muted-foreground">{t("commentsLoading")}</p>
						)}
						{!isLoading && comments.length === 0 && (
							<p className="text-sm text-muted-foreground">{t("commentsEmpty")}</p>
						)}
						{comments.map((comment) => (
							<div
								key={comment.id}
								className="rounded-lg border border-border/60 px-4 py-3"
							>
								<div className="flex gap-3">
									<Avatar className="mt-0.5 h-9 w-9 shrink-0">
										{comment.avatar_url ? (
											<AvatarImage src={comment.avatar_url} alt={comment.author_name || "User"} />
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
											<div className="pt-2">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => void onToggleLike(comment.id, comment.user_liked)}
													disabled={likingId === comment.id}
													className={comment.user_liked
														? "-ml-2 h-8 px-2 text-foreground hover:text-foreground"
														: "-ml-2 h-8 px-2 text-muted-foreground hover:text-foreground"}
												>
													<Heart className={comment.user_liked ? "mr-1.5 h-4 w-4 fill-current text-red-500" : "mr-1.5 h-4 w-4"} />
													{t("commentsLikeCount", { count: comment.like_count })}
												</Button>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
