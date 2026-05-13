"use client";

import { useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import {
	getNotificationById,
	type DashboardNotification,
} from "@/lib/actions/notifications-actions";
import { createClient } from "@/lib/supabase/client";

function getNotificationPlainMessage(
	notification: DashboardNotification,
	fallbacks: {
		userFallback: string;
		articleMissing: string;
		replyMessage: (actor: string, article: string) => string;
		likeMessage: (actor: string, article: string) => string;
		systemMessage: string;
	}
): string {
	const actorName = notification.actor.name || fallbacks.userFallback;
	const articleTitle =
		notification.article?.title ||
		notification.metadata.article_key?.replace(/^blog:/, "") ||
		fallbacks.articleMissing;

	if (notification.type === "reply") {
		return fallbacks.replyMessage(actorName, articleTitle);
	}
	if (notification.type === "like") {
		return fallbacks.likeMessage(actorName, articleTitle);
	}
	return notification.message || fallbacks.systemMessage;
}

/**
 * Mounts a global Supabase realtime subscription that shows a toast whenever
 * the current user receives a new notification. Render this once near the root
 * of the app (e.g. alongside <ToasterProvider />).
 */
export function NotificationToastListener() {
	const locale = useLocale();
	const t = useTranslations("dashboard.notifications");
	const supabase = useMemo(() => createClient(), []);

	const toastTitle = t("live.toastTitle");
	const viewLabel = t("actions.view");
	const userFallback = t("hover.userFallback");
	const articleMissing = t("hover.articleMissing");
	const replyMessage = (actor: string, article: string) =>
		t("content.replyMessage", { actor, article });
	const likeMessage = (actor: string, article: string) =>
		t("content.likeMessage", { actor, article });
	const systemMessage = t("content.systemMessage");

	useEffect(() => {
		let isDisposed = false;

		const setup = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user || isDisposed) return;

			const channel = supabase
				.channel(`notification-toast-listener-${user.id}`)
				.on(
					"postgres_changes",
					{
						event: "INSERT",
						schema: "public",
						table: "notifications",
						filter: `user_id=eq.${user.id}`,
					},
					async (payload) => {
						if (isDisposed) return;
						const rawId = String(
							(payload.new as Record<string, unknown>).id
						);
						const result = await getNotificationById(rawId, locale);
						if (!result.success || !result.data || isDisposed) return;

						const notification = result.data;
						const description = getNotificationPlainMessage(notification, {
							userFallback,
							articleMissing,
							replyMessage,
							likeMessage,
							systemMessage,
						});

						toast.message(toastTitle, {
							description,
							action: notification.target_url
								? {
										label: viewLabel,
										onClick: () => {
											window.location.href = notification.target_url!;
										},
								  }
								: undefined,
						});
					}
				)
				.subscribe();

			return () => {
				void supabase.removeChannel(channel);
			};
		};

		let cleanup: (() => void) | undefined;
		void setup().then((fn) => {
			cleanup = fn;
		});

		return () => {
			isDisposed = true;
			cleanup?.();
		};
	}, [
		supabase,
		locale,
		toastTitle,
		viewLabel,
		userFallback,
		articleMissing,
		replyMessage,
		likeMessage,
		systemMessage,
	]);

	return null;
}
