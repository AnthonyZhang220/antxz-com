"use server";

import { type ActionResult, ok, err } from "@/lib/actions/action-result";
import { getActionUser } from "./auth";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { moderateComment } from "@/lib/comments/moderation";
import { isCommentAdminUser } from "@/lib/comments/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
	createNotification,
	getActorProfile,
	getArticleNotificationTarget,
	getBlogTargetUrl,
} from "@/lib/comments/notifications";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LikerInfo {
	user_id: string;
	avatar_url: string;
	author_name: string;
}
export interface CommentItem {
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
	likers?: LikerInfo[];
}

export interface TreeCommentItem extends CommentItem {
	replies: TreeCommentItem[];
}

export type SubmitCommentResult =
	| { ok: true; comment: CommentItem }
	| { ok: false; message: string; reasons: string[] };

export interface AdminCommentData {
	id: string;
	article_key: string;
	user_id: string;
	author_name: string;
	avatar_url: string;
	content: string;
	status: "published" | "quarantine" | "spam" | "blocked";
	created_at: string;
}

const manageableStatuses = new Set([
	"published",
	"quarantine",
	"spam",
	"blocked",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireCommentAdmin() {
	const { user } = await getActionUser();

	if (!user || !isCommentAdminUser(user)) {
		return null;
	}
	return user;
}

// ─── Submit ───────────────────────────────────────────────────────────────────

export async function submitComment(
	articleKey: string,
	content: string,
	parentId?: string,
): Promise<SubmitCommentResult> {
	const t = await getTranslations("blog");

	try {
		const { supabase, user } = await getActionUser(t("commentsLoginRequired"));

		const trimmedContent = String(content ?? "").trim();
		const trimmedArticleKey = String(articleKey ?? "").trim();

		if (!trimmedArticleKey || !trimmedContent) {
			return { ok: false, message: t("commentsSubmitError"), reasons: [] };
		}

		if (trimmedContent.length > 4000) {
			return {
				ok: false,
				message: t("commentsSubmitError"),
				reasons: ["too_long"],
			};
		}

		let finalParentId: string | null = null;
		let parentCommentUserId: string | null = null;

		if (parentId) {
			const trimmedParentId = String(parentId).trim();
			const { data: parentComment, error: parentError } = await supabase
				.from("comments")
				.select("id, user_id")
				.eq("id", trimmedParentId)
				.eq("status", "published")
				.maybeSingle();

			if (parentError || !parentComment) {
				return { ok: false, message: t("commentsSubmitError"), reasons: [] };
			}

			finalParentId = trimmedParentId;
			parentCommentUserId = String(parentComment.user_id);
		}
		const defaultName =
			user.user_metadata?.full_name ||
			user.user_metadata?.name ||
			user.email?.split("@")[0] ||
			"User";
		const defaultAvatarUrl = String(
			user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
		);

		const { data: blockedUser } = await supabase
			.from("comment_blocked_users")
			.select("user_id")
			.eq("user_id", user.id)
			.maybeSingle();

		const { data: recentComments } = await supabase
			.from("comments")
			.select("content, created_at")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false })
			.limit(5);

		const moderation = blockedUser
			? { status: "blocked" as const, reasons: ["blocked_user"] }
			: moderateComment({
					content: trimmedContent,
					articleKey: trimmedArticleKey,
					userId: user.id,
					recentComments: recentComments ?? [],
				});

		if (moderation.status === "blocked") {
			return {
				ok: false,
				message: t("commentsErrorBlocked"),
				reasons: moderation.reasons,
			};
		}

		if (moderation.status === "spam") {
			return {
				ok: false,
				message: t("commentsErrorSpam"),
				reasons: moderation.reasons,
			};
		}

		if (moderation.status === "quarantine") {
			return {
				ok: false,
				message: t("commentsErrorQuarantine"),
				reasons: moderation.reasons,
			};
		}

		const { data, error } = await supabase
			.from("comments")
			.insert({
				article_key: trimmedArticleKey,
				user_id: user.id,
				author_name: defaultName,
				avatar_url: defaultAvatarUrl,
				content: trimmedContent,
				status: "published",
				parent_id: finalParentId,
			})
			.select(
				"id, article_key, author_name, avatar_url, content, created_at, status",
			)
			.single();
		if (error) {
			return { ok: false, message: t("commentsSubmitError"), reasons: [] };
		}

		const articleTargetUserId =
			await getArticleNotificationTarget(trimmedArticleKey);
		if (data.status === "published") {
			const actor = getActorProfile(user);

			if (
				finalParentId &&
				parentCommentUserId &&
				parentCommentUserId !== user.id
			) {
				await createNotification({
					userId: parentCommentUserId,
					actorUserId: user.id,
					type: "reply",
					title: "Someone replied to your comment",
					message: `${actor.name} replied: ${trimmedContent.slice(0, 140)}`,
					actorName: actor.name,
					actorAvatarUrl: actor.avatarUrl,
					targetUrl: getBlogTargetUrl(trimmedArticleKey),
					metadata: {
						article_key: trimmedArticleKey,
						comment_id: data.id,
						event: "comment_reply",
						comment_preview: trimmedContent.slice(0, 140),
						actor_bio: actor.bio,
						actor_website: actor.website,
					},
				});
			} else if (
				!finalParentId &&
				articleTargetUserId &&
				articleTargetUserId !== user.id
			) {
				await createNotification({
					userId: articleTargetUserId,
					actorUserId: user.id,
					type: "reply",
					title: "New reply on your post",
					message: `${actor.name} replied: ${trimmedContent.slice(0, 140)}`,
					actorName: actor.name,
					actorAvatarUrl: actor.avatarUrl,
					targetUrl: getBlogTargetUrl(trimmedArticleKey),
					metadata: {
						article_key: trimmedArticleKey,
						comment_id: data.id,
						event: "comment_created",
						comment_preview: trimmedContent.slice(0, 140),
						actor_bio: actor.bio,
						actor_website: actor.website,
					},
				});
			}
		}

		return { ok: true, comment: data as CommentItem };
	} catch (error) {
		return {
			ok: false,
			message:
				error instanceof Error ? error.message : t("commentsSubmitError"),
			reasons: [],
		};
	}
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteComment(commentId: string): Promise<ActionResult> {
	const t = await getTranslations("blog");
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return err("COMMENTS_LOGIN_REQUIRED", t("commentsLoginRequired"), 401);
	}

	const trimmedCommentId = String(commentId ?? "").trim();
	if (!trimmedCommentId) {
		return err("COMMENTS_DELETE_INVALID_ID", t("commentsDeleteError"), 400);
	}

	const { data: comment, error: findError } = await supabase
		.from("comments")
		.select("id, user_id")
		.eq("id", trimmedCommentId)
		.maybeSingle();

	if (findError || !comment) {
		return err("COMMENTS_DELETE_NOT_FOUND", t("commentsDeleteError"), 404);
	}

	if (String(comment.user_id) !== user.id) {
		return err("COMMENTS_DELETE_FORBIDDEN", t("commentsDeleteForbidden"), 403);
	}

	const { error: deleteError } = await supabase
		.from("comments")
		.delete()
		.eq("id", trimmedCommentId)
		.eq("user_id", user.id);

	if (deleteError) {
		return err("COMMENTS_DELETE_FAILED", t("commentsDeleteError"), 500);
	}

	return ok();
}

// ─── Like / Unlike ────────────────────────────────────────────────────────────
export async function likeComment(commentId: string): Promise<ActionResult> {
	const t = await getTranslations("blog");

	try {
		const { supabase, user } = await getActionUser(t("commentsLoginRequired"));

		const trimmedCommentId = String(commentId ?? "").trim();
		if (!trimmedCommentId) {
			return err("COMMENTS_LIKE_INVALID_ID", t("commentsLikeError"), 400);
		}

		const { data: comment, error: commentError } = await supabase
			.from("comments")
			.select("id, article_key, user_id, author_name")
			.eq("id", trimmedCommentId)
			.maybeSingle();

		if (commentError || !comment) {
			return err("COMMENTS_LIKE_NOT_FOUND", t("commentsLikeError"), 404);
		}

		const actor = getActorProfile(user);
		const { error } = await supabase.from("comment_likes").insert({
			comment_id: trimmedCommentId,
			user_id: user.id,
			avatar_url: actor.avatarUrl,
			author_name: actor.name,
		});

		if (error) {
			if (error.code === "23505") return ok(); // 已点赞，忽略
			return err("COMMENTS_LIKE_FAILED", t("commentsLikeError"), 500);
		}

		if (comment.user_id && comment.user_id !== user.id) {
			await createNotification({
				userId: String(comment.user_id),
				actorUserId: user.id,
				type: "like",
				title: "Someone liked your comment",
				message: `${actor.name} liked your comment on ${String(comment.article_key).replace(/^blog:/, "")}.`,
				actorName: actor.name,
				actorAvatarUrl: actor.avatarUrl,
				targetUrl: getBlogTargetUrl(String(comment.article_key)),
				metadata: {
					article_key: comment.article_key,
					comment_id: comment.id,
					event: "comment_like",
					actor_bio: actor.bio,
					actor_website: actor.website,
				},
			});
		}

		return ok();
	} catch (error) {
		return err(
			"COMMENTS_LIKE_FAILED",
			error instanceof Error ? error.message : t("commentsLikeError"),
			500,
		);
	}
}

export async function unlikeComment(commentId: string): Promise<ActionResult> {
	const t = await getTranslations("blog");
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return err("COMMENTS_LOGIN_REQUIRED", t("commentsLoginRequired"), 401);
	}

	const trimmedCommentId = String(commentId ?? "").trim();
	if (!trimmedCommentId) {
		return err("COMMENTS_UNLIKE_INVALID_ID", t("commentsLikeError"), 400);
	}

	const { error } = await supabase
		.from("comment_likes")
		.delete()
		.eq("comment_id", trimmedCommentId)
		.eq("user_id", user.id);

	if (error) {
		return err("COMMENTS_UNLIKE_FAILED", t("commentsLikeError"), 500);
	}

	return ok();
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getCommentModerationQueue(): Promise<
	ActionResult<{ comments: AdminCommentData[]; forbidden: boolean }>
> {
	const adminUser = await requireCommentAdmin();
	if (!adminUser) {
		return ok({ comments: [], forbidden: true });
	}

	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("comments")
		.select(
			"id, article_key, user_id, author_name, avatar_url, content, status, created_at",
		)
		.in("status", ["quarantine", "spam", "blocked"])
		.order("created_at", { ascending: false })
		.limit(100);

	if (error) {
		const tm = await getTranslations("toast.dashboard.comments");
		return err("COMMENTS_ADMIN_QUEUE_LOAD_FAILED", tm("loadError"), 500);
	}

	return ok({ comments: (data ?? []) as AdminCommentData[], forbidden: false });
}

export async function setCommentModerationStatus(
	commentId: string,
	status: "published" | "quarantine" | "spam" | "blocked",
): Promise<ActionResult> {
	const adminUser = await requireCommentAdmin();
	if (!adminUser) {
		const t = await getTranslations("dashboard.comments");
		return err("COMMENTS_ADMIN_FORBIDDEN", t("adminForbidden"), 403);
	}

	const trimmedCommentId = String(commentId ?? "").trim();
	if (!trimmedCommentId || !manageableStatuses.has(status)) {
		const tm = await getTranslations("toast.dashboard.comments");
		return err("COMMENTS_ADMIN_INVALID_STATUS_UPDATE", tm("updateError"), 400);
	}

	const supabase = createAdminClient();
	const { error } = await supabase
		.from("comments")
		.update({ status })
		.eq("id", trimmedCommentId);

	if (error) {
		const tm = await getTranslations("toast.dashboard.comments");
		return err("COMMENTS_ADMIN_STATUS_UPDATE_FAILED", tm("updateError"), 500);
	}

	return ok();
}

export async function deleteCommentAsAdmin(
	commentId: string,
): Promise<ActionResult> {
	const adminUser = await requireCommentAdmin();
	if (!adminUser) {
		const t = await getTranslations("dashboard.comments");
		return err("COMMENTS_ADMIN_FORBIDDEN", t("adminForbidden"), 403);
	}

	const trimmedCommentId = String(commentId ?? "").trim();
	if (!trimmedCommentId) {
		const tm = await getTranslations("toast.dashboard.comments");
		return err("COMMENTS_ADMIN_INVALID_DELETE", tm("updateError"), 400);
	}

	const supabase = createAdminClient();
	const { error } = await supabase
		.from("comments")
		.delete()
		.eq("id", trimmedCommentId);

	if (error) {
		const tm = await getTranslations("toast.dashboard.comments");
		return err("COMMENTS_ADMIN_DELETE_FAILED", tm("updateError"), 500);
	}

	return ok();
}

export async function blockCommentUser(userId: string): Promise<ActionResult> {
	const adminUser = await requireCommentAdmin();
	if (!adminUser) {
		const t = await getTranslations("dashboard.comments");
		return err("COMMENTS_ADMIN_FORBIDDEN", t("adminForbidden"), 403);
	}

	const trimmedUserId = String(userId ?? "").trim();
	if (!trimmedUserId) {
		const tm = await getTranslations("toast.dashboard.comments");
		return err("COMMENTS_ADMIN_INVALID_USER", tm("updateError"), 400);
	}

	const supabase = createAdminClient();
	const { error: blockError } = await supabase
		.from("comment_blocked_users")
		.upsert({ user_id: trimmedUserId, blocked_by: adminUser.id });

	if (blockError) {
		const tm = await getTranslations("toast.dashboard.comments");
		return err("COMMENTS_ADMIN_BLOCK_USER_FAILED", tm("updateError"), 500);
	}

	const { error: updateError } = await supabase
		.from("comments")
		.update({ status: "blocked" })
		.eq("user_id", trimmedUserId)
		.in("status", ["published", "quarantine", "spam"]);

	if (updateError) {
		const tm = await getTranslations("toast.dashboard.comments");
		return err(
			"COMMENTS_ADMIN_BLOCK_USER_UPDATE_FAILED",
			tm("updateError"),
			500,
		);
	}

	return ok();
}

// ─── Get Comments ────────────────────────────────────────────────────
export async function getCommentsByArticleKey(
	articleKey: string,
	currentUserId: string | null,
): Promise<ActionResult<CommentItem[]>> {
	const supabase = await createClient();
	const { data: rawComments, error } = await supabase
		.from("comments")
		.select(
			`
            *,
            user_liked:comment_likes!left(user_id)
        `,
		)
		.eq("article_key", articleKey)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("[DB Error] Fetch comments failed:", error);
		const tm = await getTranslations("toast.dashboard.comments");
		return err("COMMENTS_FETCH_FAILED", tm("fetchError"), 500);
	}

	// 直接在数据层把数据清洗好，别留给 Page
	return ok(
		(rawComments || []).map((c: CommentItem) => {
			const hasLiked = Array.isArray(c.user_liked)
				? c.user_liked.some((l: CommentItem) => l.user_id === currentUserId)
				: !!c.user_liked;

			return {
				...c,
				user_liked: hasLiked,
				like_count: c.like_count || 0,
			};
		}),
	);
}
