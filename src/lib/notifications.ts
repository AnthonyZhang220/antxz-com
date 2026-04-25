import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

type CreateNotificationInput = {
	userId: string;
	actorUserId?: string | null;
	type: "reply" | "like" | "mention" | "system";
	title: string;
	message: string;
	actorName?: string;
	actorAvatarUrl?: string;
	targetUrl?: string | null;
	metadata?: Record<string, unknown>;
};

export function getActorProfile(user: User) {
	return {
		name:
			String(
				user.user_metadata?.full_name ||
					user.user_metadata?.name ||
					user.email?.split("@")[0] ||
					"User"
			) || "User",
		avatarUrl: String(
			user.user_metadata?.avatar_url || user.user_metadata?.picture || ""
		),
	};
}

export function getBlogTargetUrl(articleKey: string) {
	if (articleKey.startsWith("blog:")) {
		return `/blog/${articleKey.slice(5)}#comments`;
	}

	return null;
}

export async function getArticleNotificationTarget(articleKey: string) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("article_notification_targets")
		.select("user_id")
		.eq("article_key", articleKey)
		.maybeSingle();

	if (error) {
		return null;
	}

	return data?.user_id ? String(data.user_id) : null;
}

export async function createNotification(input: CreateNotificationInput) {
	const supabase = await createClient();
	const { error } = await supabase.rpc("create_notification", {
		p_user_id: input.userId,
		p_actor_user_id: input.actorUserId ?? null,
		p_type: input.type,
		p_title: input.title,
		p_message: input.message,
		p_actor_name: input.actorName ?? "System",
		p_actor_avatar_url: input.actorAvatarUrl ?? "",
		p_target_url: input.targetUrl ?? null,
		p_metadata: input.metadata ?? {},
	});

	if (error) {
		throw new Error(error.message || "Failed to create notification");
	}
}