"use server";

import { getTranslations } from "next-intl/server";
import { createActionError } from "@/lib/errors/action-error";
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

interface CommentData {
	id: string;
	article_key: string;
	author_name: string;
	avatar_url: string;
	content: string;
	created_at: string;
	status: "published" | "quarantine" | "spam" | "blocked";
}

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

const manageableStatuses = new Set(["published", "quarantine", "spam", "blocked"]);

async function requireCommentAdmin() {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user || !isCommentAdminUser(user)) {
		return null;
	}

	return user;
}

/**
 * 提交评论
 * @throws {Error} 如果验证或保存失败，错误消息将被翻译
 */
export async function submitComment(
	articleKey: string,
	content: string,
	parentId?: string
): Promise<CommentData> {
	const t = await getTranslations("blog");
	const supabase = await createClient();

	// 验证用户
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		throw createActionError("COMMENTS_LOGIN_REQUIRED", t("commentsLoginRequired"), { status: 401 });
	}

	// 验证输入
	const trimmedContent = String(content ?? "").trim();
	const trimmedArticleKey = String(articleKey ?? "").trim();

	if (!trimmedArticleKey || !trimmedContent) {
		throw createActionError("COMMENTS_SUBMIT_INVALID_INPUT", t("commentsSubmitError"), { status: 400 });
	}

	if (trimmedContent.length > 4000) {
		throw createActionError("COMMENTS_SUBMIT_TOO_LONG", t("commentsSubmitError"), { status: 400 });
	}

	// 验证 parentId
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
			throw createActionError("COMMENTS_PARENT_NOT_FOUND", t("commentsSubmitError"), { status: 404 });
		}

		finalParentId = trimmedParentId;
		parentCommentUserId = String(parentComment.user_id);
	}

	// 获取用户信息
	const defaultName =
		user.user_metadata?.full_name ||
		user.user_metadata?.name ||
		user.email?.split("@")[0] ||
		"User";
	const defaultAvatarUrl = String(
		user.user_metadata?.avatar_url || user.user_metadata?.picture || ""
	);

	// 检查用户是否被阻止
	const { data: blockedUser } = await supabase
		.from("comment_blocked_users")
		.select("user_id")
		.eq("user_id", user.id)
		.maybeSingle();

	// 获取最近的评论
	const { data: recentComments } = await supabase
		.from("comments")
		.select("content, created_at")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.limit(5);

	// 审核评论
	const moderation = blockedUser
		? { status: "blocked" as const, reasons: ["blocked_user"] }
		: moderateComment({
				content: trimmedContent,
				articleKey: trimmedArticleKey,
				userId: user.id,
				recentComments: recentComments ?? [],
			});

	// 检查审核状态并返回适当的错误
	if (moderation.status === "blocked") {
		throw createActionError("COMMENTS_BLOCKED", t("commentsErrorBlocked"), {
			reasons: moderation.reasons,
			status: 403,
		});
	}

	if (moderation.status === "spam") {
		throw createActionError("COMMENTS_SPAM", t("commentsErrorSpam"), {
			reasons: moderation.reasons,
			status: 400,
		});
	}

	if (moderation.status === "quarantine") {
		throw createActionError("COMMENTS_QUARANTINE", t("commentsErrorQuarantine"), {
			reasons: moderation.reasons,
			status: 400,
		});
	}

	// 插入评论
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
			"id, article_key, author_name, avatar_url, content, created_at, status"
		)
		.single();

	if (error) {
		throw createActionError("COMMENTS_SUBMIT_FAILED", t("commentsSubmitError"), { status: 500 });
	}

	// 发送通知
	const articleTargetUserId = await getArticleNotificationTarget(
		trimmedArticleKey
	);
	if (data.status === "published") {
		const actor = getActorProfile(user);

		if (finalParentId && parentCommentUserId && parentCommentUserId !== user.id) {
			// 回复评论 → 通知评论作者
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
			// 顶级评论 → 通知文章作者
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

	return data as CommentData;
}

/**
 * 删除评论
 * @throws {Error} 如果用户未授权或评论不存在
 */
export async function deleteComment(commentId: string): Promise<void> {
	const t = await getTranslations("blog");
	const supabase = await createClient();

	// 验证用户
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		throw createActionError("COMMENTS_LOGIN_REQUIRED", t("commentsLoginRequired"), { status: 401 });
	}

	const trimmedCommentId = String(commentId ?? "").trim();

	if (!trimmedCommentId) {
		throw createActionError("COMMENTS_DELETE_INVALID_ID", t("commentsDeleteError"), { status: 400 });
	}

	// 检查评论是否存在且属于用户
	const { data: comment, error: findError } = await supabase
		.from("comments")
		.select("id, user_id")
		.eq("id", trimmedCommentId)
		.maybeSingle();

	if (findError || !comment) {
		throw createActionError("COMMENTS_DELETE_NOT_FOUND", t("commentsDeleteError"), { status: 404 });
	}

	if (String(comment.user_id) !== user.id) {
		throw createActionError("COMMENTS_DELETE_FORBIDDEN", t("commentsDeleteForbidden"), { status: 403 });
	}

	// 删除评论
	const { error: deleteError } = await supabase
		.from("comments")
		.delete()
		.eq("id", trimmedCommentId)
		.eq("user_id", user.id);

	if (deleteError) {
		throw createActionError("COMMENTS_DELETE_FAILED", t("commentsDeleteError"), { status: 500 });
	}
}

/**
 * 点赞评论
 * @throws {Error} 如果用户未授权或评论不存在
 */
export async function likeComment(commentId: string): Promise<void> {
	const supabase = await createClient();
	const t = await getTranslations("blog");

	// 验证用户
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		throw createActionError("COMMENTS_LOGIN_REQUIRED", t("commentsLoginRequired"), { status: 401 });
	}

	const trimmedCommentId = String(commentId ?? "").trim();

	if (!trimmedCommentId) {
		throw createActionError("COMMENTS_LIKE_INVALID_ID", t("commentsLikeError"), { status: 400 });
	}

	// 获取评论信息
	const { data: comment, error: commentError } = await supabase
		.from("comments")
		.select("id, article_key, user_id, author_name")
		.eq("id", trimmedCommentId)
		.maybeSingle();

	if (commentError || !comment) {
		throw createActionError("COMMENTS_LIKE_NOT_FOUND", t("commentsLikeError"), { status: 404 });
	}

	// 添加点赞
	const actor = getActorProfile(user);
	const { error } = await supabase.from("comment_likes").insert({
		comment_id: trimmedCommentId,
		user_id: user.id,
		avatar_url: actor.avatarUrl,
		author_name: actor.name,
	});

	if (error) {
		if (error.code === "23505") {
			// 已经点过赞，忽略
			return;
		}
		throw createActionError("COMMENTS_LIKE_FAILED", t("commentsLikeError"), { status: 500 });
	}

	// 发送通知
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
}

/**
 * 取消点赞评论
 * @throws {Error} 如果用户未授权
 */
export async function unlikeComment(commentId: string): Promise<void> {
	const t = await getTranslations("blog");
	const supabase = await createClient();

	// 验证用户
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		throw createActionError("COMMENTS_LOGIN_REQUIRED", t("commentsLoginRequired"), { status: 401 });
	}

	const trimmedCommentId = String(commentId ?? "").trim();

	if (!trimmedCommentId) {
		throw createActionError("COMMENTS_UNLIKE_INVALID_ID", t("commentsLikeError"), { status: 400 });
	}

	// 删除点赞
	const { error } = await supabase
		.from("comment_likes")
		.delete()
		.eq("comment_id", trimmedCommentId)
		.eq("user_id", user.id);

	if (error) {
		throw createActionError("COMMENTS_UNLIKE_FAILED", t("commentsLikeError"), { status: 500 });
	}
}

export async function getCommentModerationQueue(): Promise<{ comments: AdminCommentData[]; forbidden: boolean }> {
	const adminUser = await requireCommentAdmin();
	if (!adminUser) {
		return { comments: [], forbidden: true };
	}

	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("comments")
		.select("id, article_key, user_id, author_name, avatar_url, content, status, created_at")
		.in("status", ["quarantine", "spam", "blocked"])
		.order("created_at", { ascending: false })
		.limit(100);

	if (error) {
		const tm = await getTranslations("toast.dashboard.comments");
		throw createActionError("COMMENTS_ADMIN_QUEUE_LOAD_FAILED", tm("loadError"), { status: 500 });
	}

	return { comments: (data ?? []) as AdminCommentData[], forbidden: false };
}

export async function setCommentModerationStatus(
	commentId: string,
	status: "published" | "quarantine" | "spam" | "blocked",
): Promise<void> {
	const adminUser = await requireCommentAdmin();
	if (!adminUser) {
		const t = await getTranslations("dashboard.comments");
		throw createActionError("COMMENTS_ADMIN_FORBIDDEN", t("adminForbidden"), { status: 403 });
	}

	const trimmedCommentId = String(commentId ?? "").trim();
	if (!trimmedCommentId || !manageableStatuses.has(status)) {
		const tm = await getTranslations("toast.dashboard.comments");
		throw createActionError("COMMENTS_ADMIN_INVALID_STATUS_UPDATE", tm("updateError"), { status: 400 });
	}

	const supabase = createAdminClient();
	const { error } = await supabase
		.from("comments")
		.update({ status })
		.eq("id", trimmedCommentId);

	if (error) {
		const tm = await getTranslations("toast.dashboard.comments");
		throw createActionError("COMMENTS_ADMIN_STATUS_UPDATE_FAILED", tm("updateError"), { status: 500 });
	}
}

export async function deleteCommentAsAdmin(commentId: string): Promise<void> {
	const adminUser = await requireCommentAdmin();
	if (!adminUser) {
		const t = await getTranslations("dashboard.comments");
		throw createActionError("COMMENTS_ADMIN_FORBIDDEN", t("adminForbidden"), { status: 403 });
	}

	const trimmedCommentId = String(commentId ?? "").trim();
	if (!trimmedCommentId) {
		const tm = await getTranslations("toast.dashboard.comments");
		throw createActionError("COMMENTS_ADMIN_INVALID_DELETE", tm("updateError"), { status: 400 });
	}

	const supabase = createAdminClient();
	const { error } = await supabase
		.from("comments")
		.delete()
		.eq("id", trimmedCommentId);

	if (error) {
		const tm = await getTranslations("toast.dashboard.comments");
		throw createActionError("COMMENTS_ADMIN_DELETE_FAILED", tm("updateError"), { status: 500 });
	}
}

export async function blockCommentUser(userId: string): Promise<void> {
	const adminUser = await requireCommentAdmin();
	if (!adminUser) {
		const t = await getTranslations("dashboard.comments");
		throw createActionError("COMMENTS_ADMIN_FORBIDDEN", t("adminForbidden"), { status: 403 });
	}

	const trimmedUserId = String(userId ?? "").trim();
	if (!trimmedUserId) {
		const tm = await getTranslations("toast.dashboard.comments");
		throw createActionError("COMMENTS_ADMIN_INVALID_USER", tm("updateError"), { status: 400 });
	}

	const supabase = createAdminClient();
	const { error: blockError } = await supabase
		.from("comment_blocked_users")
		.upsert({
			user_id: trimmedUserId,
			blocked_by: adminUser.id,
		});

	if (blockError) {
		const tm = await getTranslations("toast.dashboard.comments");
		throw createActionError("COMMENTS_ADMIN_BLOCK_USER_FAILED", tm("updateError"), { status: 500 });
	}

	const { error: updateError } = await supabase
		.from("comments")
		.update({ status: "blocked" })
		.eq("user_id", trimmedUserId)
		.in("status", ["published", "quarantine", "spam"]);

	if (updateError) {
		const tm = await getTranslations("toast.dashboard.comments");
		throw createActionError("COMMENTS_ADMIN_BLOCK_USER_UPDATE_FAILED", tm("updateError"), { status: 500 });
	}
}
