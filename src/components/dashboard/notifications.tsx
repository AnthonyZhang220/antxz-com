"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Heart, MessageCircleReply, RefreshCw, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { handleError, handleSuccess } from "@/lib/error-utils";

import {
	getNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
	type DashboardNotification,
	type DashboardNotificationType,
} from "@/components/dashboard/notifications-actions";

type FilterKey = "all" | "unread" | DashboardNotificationType;

const filterOrder: FilterKey[] = ["all", "unread", "reply", "like"];

function getRelativeTime(locale: string, value: string): string {
	const now = Date.now();
	const then = new Date(value).getTime();

	if (Number.isNaN(then)) {
		return "-";
	}

	const diffSeconds = Math.round((then - now) / 1000);
	const abs = Math.abs(diffSeconds);
	const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

	if (abs < 60) {
		return rtf.format(diffSeconds, "second");
	}

	const diffMinutes = Math.round(diffSeconds / 60);
	if (Math.abs(diffMinutes) < 60) {
		return rtf.format(diffMinutes, "minute");
	}

	const diffHours = Math.round(diffMinutes / 60);
	if (Math.abs(diffHours) < 24) {
		return rtf.format(diffHours, "hour");
	}

	const diffDays = Math.round(diffHours / 24);
	if (Math.abs(diffDays) < 30) {
		return rtf.format(diffDays, "day");
	}

	const diffMonths = Math.round(diffDays / 30);
	if (Math.abs(diffMonths) < 12) {
		return rtf.format(diffMonths, "month");
	}

	const diffYears = Math.round(diffMonths / 12);
	return rtf.format(diffYears, "year");
}

function getInitials(name: string): string {
	const trimmed = name.trim();
	if (!trimmed) {
		return "U";
	}

	const parts = trimmed.split(/\s+/);
	return (parts[0]?.[0] || "U").toUpperCase();
}

function getTypeIcon(type: DashboardNotificationType) {
	if (type === "reply") {
		return MessageCircleReply;
	}

	if (type === "like") {
		return Heart;
	}

	if (type === "mention") {
		return Bell;
	}

	return Sparkles;
}

export default function DashboardNotifications() {
	const t = useTranslations("dashboard.notifications");
	const locale = useLocale();

	const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isMutating, setIsMutating] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

	const unreadCount = useMemo(
		() => notifications.filter((item) => !item.is_read).length,
		[notifications]
	);

	const filteredNotifications = useMemo(() => {
		if (activeFilter === "all") {
			return notifications;
		}

		if (activeFilter === "unread") {
			return notifications.filter((item) => !item.is_read);
		}

		return notifications.filter((item) => item.type === activeFilter);
	}, [activeFilter, notifications]);

	const loadErrorMessage = t("messages.loadError");
	const markReadErrorMessage = t("messages.markReadError");
	const markAllReadErrorMessage = t("messages.markAllReadError");

	const loadNotifications = async (withLoading: boolean) => {
		if (withLoading) {
			setIsLoading(true);
		}
		setLoadError(null);

		const result = await getNotifications();
		if (!result.success) {
			setLoadError(result.error || loadErrorMessage);
			setIsLoading(false);
			return;
		}

		setNotifications(result.data || []);
		setIsLoading(false);
	};

	useEffect(() => {
		let isMounted = true;

		const load = async () => {
			setLoadError(null);
			const result = await getNotifications();
			if (!isMounted) {
				return;
			}

			if (!result.success) {
				setLoadError(result.error || loadErrorMessage);
				setIsLoading(false);
				return;
			}

			setNotifications(result.data || []);
			setIsLoading(false);
		};

		void load();

		return () => {
			isMounted = false;
		};
	}, [loadErrorMessage]);

	const onMarkRead = async (id: string) => {
		setIsMutating(true);

		const result = await markNotificationAsRead(id);
		if (!result.success) {
			handleError(new Error(result.error || markReadErrorMessage), markReadErrorMessage);
			setIsMutating(false);
			return;
		}

		setNotifications((prev) =>
			prev.map((item) =>
				item.id === id
					? {
						...item,
						is_read: true,
						read_at: new Date().toISOString(),
					}
					: item
			)
		);

		setIsMutating(false);
	};

	const onMarkAllRead = async () => {
		setIsMutating(true);

		const result = await markAllNotificationsAsRead();
		if (!result.success) {
			handleError(new Error(result.error || markAllReadErrorMessage), markAllReadErrorMessage);
			setIsMutating(false);
			return;
		}

		setNotifications((prev) =>
			prev.map((item) => ({
				...item,
				is_read: true,
				read_at: item.read_at || new Date().toISOString(),
			}))
		);
		handleSuccess(t("messages.markAllReadSuccess"));

		setIsMutating(false);
	};

	if (isLoading) {
		return <DashboardPageSkeleton rows={5} />;
	}

	if (loadError) {
		return (
			<div className="space-y-6 p-4 lg:p-6">
				<ErrorState
					title={t("title")}
					description={loadError}
					onRetry={() => void loadNotifications(true)}
					retryLabel={t("actions.refresh")}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-4 lg:p-6">
			<Card>
				<CardHeader className="gap-3">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div className="space-y-1">
							<CardTitle>{t("title")}</CardTitle>
							<CardDescription>{t("description")}</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="outline">{t("unreadCount", { count: unreadCount })}</Badge>
							<Button
								variant="outline"
								size="sm"
								onClick={() => void loadNotifications(true)}
								disabled={isMutating}
							>
								<RefreshCw className="size-4" />
								{t("actions.refresh")}
							</Button>
							<Button
								variant="default"
								size="sm"
								onClick={onMarkAllRead}
								disabled={isMutating || unreadCount === 0}
							>
								{t("actions.markAllRead")}
							</Button>
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						{filterOrder.map((filter) => (
							<Button
								key={filter}
								variant={activeFilter === filter ? "default" : "outline"}
								size="sm"
								onClick={() => setActiveFilter(filter)}
							>
								{t(`filters.${filter}`)}
							</Button>
						))}
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					{filteredNotifications.length === 0 ? (
						<div className="rounded-lg border border-dashed p-8 text-center">
							<p className="text-sm font-medium">{t("empty.title")}</p>
							<p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p>
						</div>
					) : (
						filteredNotifications.map((notification) => {
							const Icon = getTypeIcon(notification.type);
							return (
								<div
									key={notification.id}
									className="rounded-lg border bg-card p-4 shadow-xs transition-colors hover:bg-muted/40"
								>
									<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
										<div className="flex min-w-0 flex-1 gap-3">
											<Avatar size="lg" className="mt-0.5">
												{notification.actor_avatar_url ? (
													<AvatarImage src={notification.actor_avatar_url} alt={notification.actor_name} />
												) : null}
												<AvatarFallback>{getInitials(notification.actor_name)}</AvatarFallback>
											</Avatar>

											<div className="min-w-0 space-y-2">
												<div className="flex flex-wrap items-center gap-2">
													<Badge variant={notification.is_read ? "outline" : "default"}>
														<Icon className="size-3" />
														{t(`types.${notification.type}`)}
													</Badge>
													{!notification.is_read ? (
														<Badge variant="secondary">{t("status.unread")}</Badge>
													) : null}
												</div>

												<p className="font-medium">{notification.title}</p>
												<p className="text-sm text-muted-foreground">{notification.message}</p>
												<p className="text-xs text-muted-foreground">
													{t("meta.from", { name: notification.actor_name })} · {getRelativeTime(locale, notification.created_at)}
												</p>
											</div>
										</div>

										<div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
											{notification.target_url ? (
												<Button variant="outline" size="sm" asChild>
													<a href={notification.target_url}>{t("actions.view")}</a>
												</Button>
											) : null}
											{notification.type === "reply" ? (
												<Button variant="outline" size="sm" asChild>
													<a href={notification.target_url || "#"}>{t("actions.reply")}</a>
												</Button>
											) : null}
											{notification.type === "like" ? (
												<Button variant="outline" size="sm" asChild>
													<a href={notification.target_url || "#"}>{t("actions.likeBack")}</a>
												</Button>
											) : null}
											{!notification.is_read ? (
												<Button
													variant="default"
													size="sm"
													onClick={() => void onMarkRead(notification.id)}
													disabled={isMutating}
												>
													{t("actions.markRead")}
												</Button>
											) : null}
										</div>
									</div>
								</div>
							);
						})
					)}
				</CardContent>
			</Card>
		</div>
	);
}
