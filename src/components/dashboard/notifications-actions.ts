"use server";

import { createClient } from "@/lib/supabase/server";

export type DashboardNotificationType = "reply" | "like" | "mention" | "system";

export type DashboardNotification = {
	id: string;
	type: DashboardNotificationType;
	title: string;
	message: string;
	actor_name: string;
	actor_avatar_url: string;
	target_url: string | null;
	is_read: boolean;
	read_at: string | null;
	created_at: string;
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

export async function getNotifications(): Promise<
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
			"id, type, title, message, actor_name, actor_avatar_url, target_url, is_read, read_at, created_at"
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

	const notifications: DashboardNotification[] = (data || []).map((item) => ({
		id: String(item.id),
		type: parseType(String(item.type)),
		title: String(item.title),
		message: String(item.message),
		actor_name: String(item.actor_name || "System"),
		actor_avatar_url: String(item.actor_avatar_url || ""),
		target_url: item.target_url ? String(item.target_url) : null,
		is_read: Boolean(item.is_read),
		read_at: item.read_at ? String(item.read_at) : null,
		created_at: String(item.created_at),
	}));

	return {
		success: true,
		data: notifications,
	};
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
