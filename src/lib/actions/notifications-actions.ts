"use server";

import { createClient } from "@/lib/supabase/server";
import { client as sanityClient } from "@/sanity/lib/client";

export type DashboardNotificationType = "reply" | "like" | "mention" | "system";

type DashboardNotificationMetadata = {
	article_key?: string;
	comment_id?: string;
	event?: string;
	comment_preview?: string;
	actor_bio?: string;
	actor_website?: string;
};

type DashboardNotificationArticle = {
	slug: string;
	title: string;
	cover_image_url: string;
	target_url: string | null;
};

type DashboardNotificationActor = {
	user_id: string | null;
	name: string;
	avatar_url: string;
	bio: string;
	website: string;
};

export type DashboardNotification = {
	id: string;
	type: DashboardNotificationType;
	title: string;
	message: string;
	actor_user_id: string | null;
	actor_name: string;
	actor_avatar_url: string;
	target_url: string | null;
	is_read: boolean;
	read_at: string | null;
	created_at: string;
	metadata: DashboardNotificationMetadata;
	actor: DashboardNotificationActor;
	article: DashboardNotificationArticle | null;
};

type NotificationsResult<T = void> =
	| { success: true; data?: T }
	| { success: false; error: string };

const allowedTypes = new Set<DashboardNotificationType>([
	"reply",
	"like",
	"mention",
	"system",
]);

function parseType(value: string): DashboardNotificationType {
	if (allowedTypes.has(value as DashboardNotificationType)) {
		return value as DashboardNotificationType;
	}

	return "system";
}

type NotificationPostSummary = {
	slug: string;
	title: string;
	coverImage?: {
		url?: string;
	};
};

const notificationPostSummaryQuery = `
	*[_type == "post" && slug.current == $slug][0] {
		"slug": slug.current,
		"title": coalesce(title[$locale], title.en, title.zh, title),
		coverImage {
			"url": asset->url
		}
	}
`;

function parseNotificationMetadata(value: unknown): DashboardNotificationMetadata {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return {};
	}

	const metadata = value as Record<string, unknown>;
	return {
		article_key:
			typeof metadata.article_key === "string" ? metadata.article_key : undefined,
		comment_id:
			typeof metadata.comment_id === "string" ? metadata.comment_id : undefined,
		event: typeof metadata.event === "string" ? metadata.event : undefined,
		comment_preview:
			typeof metadata.comment_preview === "string"
				? metadata.comment_preview
				: undefined,
		actor_bio:
			typeof metadata.actor_bio === "string" ? metadata.actor_bio : undefined,
		actor_website:
			typeof metadata.actor_website === "string"
				? metadata.actor_website
				: undefined,
	};
}

function getArticleSlug(articleKey?: string): string | null {
	if (!articleKey) {
		return null;
	}

	if (articleKey.startsWith("blog:")) {
		return articleKey.slice(5);
	}

	return null;
}

export async function getNotifications(locale: string): Promise<
	NotificationsResult<DashboardNotification[]>
> {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { success: false, error: "Not authenticated" };
	}

	const { data, error } = await supabase
		.from("notifications")
		.select(
			"id, type, title, message, actor_user_id, actor_name, actor_avatar_url, target_url, is_read, read_at, created_at, metadata"
		)
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.limit(100);

	if (error) {
		return {
			success: false,
			error: error.message || "Failed to load notifications",
		};
	}

	const articleSlugs = Array.from(
		new Set(
			(data || [])
				.map((item) => getArticleSlug(parseNotificationMetadata(item.metadata).article_key))
				.filter((slug): slug is string => Boolean(slug))
		)
	);

	const articleEntries = await Promise.all(
		articleSlugs.map(async (slug) => {
			const post = await sanityClient.fetch<NotificationPostSummary | null>(
				notificationPostSummaryQuery,
				{ slug, locale }
			);

			return [slug, post] as const;
		})
	);

	const articleMap = new Map(articleEntries);

	const notifications: DashboardNotification[] = (data || []).map((item) => {
		const metadata = parseNotificationMetadata(item.metadata);
		const slug = getArticleSlug(metadata.article_key);
		const articleSummary = slug ? articleMap.get(slug) : null;

		return {
			id: String(item.id),
			type: parseType(String(item.type)),
			title: String(item.title),
			message: String(item.message),
			actor_user_id: item.actor_user_id ? String(item.actor_user_id) : null,
			actor_name: String(item.actor_name || "System"),
			actor_avatar_url: String(item.actor_avatar_url || ""),
			target_url: item.target_url ? String(item.target_url) : null,
			is_read: Boolean(item.is_read),
			read_at: item.read_at ? String(item.read_at) : null,
			created_at: String(item.created_at),
			metadata,
			actor: {
				user_id: item.actor_user_id ? String(item.actor_user_id) : null,
				name: String(item.actor_name || "System"),
				avatar_url: String(item.actor_avatar_url || ""),
				bio: metadata.actor_bio || "",
				website: metadata.actor_website || "",
			},
			article:
				slug && articleSummary
					? {
						slug,
						title: String(articleSummary.title || slug),
						cover_image_url: String(articleSummary.coverImage?.url || ""),
						target_url: item.target_url ? String(item.target_url) : `/blog/${slug}`,
					}
					: null,
		};
	});

	return {
		success: true,
		data: notifications,
	};
}

export async function getNotificationById(
	id: string,
	locale: string
): Promise<NotificationsResult<DashboardNotification>> {
	if (!id.trim()) {
		return { success: false, error: "Missing notification id" };
	}

	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { success: false, error: "Not authenticated" };
	}

	const { data, error } = await supabase
		.from("notifications")
		.select(
			"id, type, title, message, actor_user_id, actor_name, actor_avatar_url, target_url, is_read, read_at, created_at, metadata"
		)
		.eq("id", id)
		.eq("user_id", user.id)
		.single();

	if (error) {
		return { success: false, error: error.message || "Failed to load notification" };
	}

	const metadata = parseNotificationMetadata(data.metadata);
	const slug = getArticleSlug(metadata.article_key);
	let articleSummary: NotificationPostSummary | null = null;

	if (slug) {
		articleSummary = await sanityClient.fetch<NotificationPostSummary | null>(
			notificationPostSummaryQuery,
			{ slug, locale }
		);
	}

	const notification: DashboardNotification = {
		id: String(data.id),
		type: parseType(String(data.type)),
		title: String(data.title),
		message: String(data.message),
		actor_user_id: data.actor_user_id ? String(data.actor_user_id) : null,
		actor_name: String(data.actor_name || "System"),
		actor_avatar_url: String(data.actor_avatar_url || ""),
		target_url: data.target_url ? String(data.target_url) : null,
		is_read: Boolean(data.is_read),
		read_at: data.read_at ? String(data.read_at) : null,
		created_at: String(data.created_at),
		metadata,
		actor: {
			user_id: data.actor_user_id ? String(data.actor_user_id) : null,
			name: String(data.actor_name || "System"),
			avatar_url: String(data.actor_avatar_url || ""),
			bio: metadata.actor_bio || "",
			website: metadata.actor_website || "",
		},
		article:
			slug && articleSummary
				? {
					slug,
					title: String(articleSummary.title || slug),
					cover_image_url: String(articleSummary.coverImage?.url || ""),
					target_url: data.target_url ? String(data.target_url) : `/blog/${slug}`,
				}
				: null,
	};

	return { success: true, data: notification };
}

export async function markNotificationAsRead(
	notificationId: string
): Promise<NotificationsResult> {
	if (!notificationId.trim()) {
		return { success: false, error: "Missing notification id" };
	}

	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { success: false, error: "Not authenticated" };
	}

	const { error } = await supabase
		.from("notifications")
		.update({ is_read: true, read_at: new Date().toISOString() })
		.eq("id", notificationId)
		.eq("user_id", user.id);

	if (error) {
		return {
			success: false,
			error: error.message || "Failed to update notification",
		};
	}

	return { success: true };
}

export async function markAllNotificationsAsRead(): Promise<NotificationsResult> {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { success: false, error: "Not authenticated" };
	}

	const { error } = await supabase
		.from("notifications")
		.update({ is_read: true, read_at: new Date().toISOString() })
		.eq("user_id", user.id)
		.eq("is_read", false);

	if (error) {
		return {
			success: false,
			error: error.message || "Failed to update notifications",
		};
	}

	return { success: true };
}
