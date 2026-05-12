"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	Bell,
	Globe,
	Heart,
	MessageCircleReply,
	RefreshCw,
	Sparkles,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
	markAllNotificationsAsRead,
	markNotificationAsRead,
	type DashboardNotification,
	type DashboardNotificationType,
} from "@/components/dashboard/notifications-actions";
import { useNotificationData } from "@/hooks/use-notifications";
import { ErrorState } from "@/components/shared/error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { handleError, handleSuccess } from "@/lib/errors/error-utils";
import { getInitials, getRelativeTime } from "@/lib/shared/format";

type FilterKey = "all" | "unread" | DashboardNotificationType;

const filterOrder: FilterKey[] = ["all", "unread", "reply", "like"];

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

function UserHoverCard({
	notification,
	bioEmptyLabel,
	websiteLabel,
	children,
}: {
	notification: DashboardNotification;
	bioEmptyLabel: string;
	websiteLabel: string;
	children: ReactNode;
}) {
	return (
		<HoverCard openDelay={120} closeDelay={120}>
			<HoverCardTrigger asChild>
				<button
					type="button"
					className="cursor-pointer font-medium text-foreground underline-offset-4 transition hover:underline"
				>
					{children}
				</button>
			</HoverCardTrigger>
			<HoverCardContent align="start" className="w-80 space-y-3">
				<div className="flex items-start gap-3">
					<Avatar size="lg">
						{notification.actor.avatar_url ? (
							<AvatarImage
								src={notification.actor.avatar_url}
								alt={notification.actor.name}
							/>
						) : null}
						<AvatarFallback>
							{getInitials(notification.actor.name)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 space-y-1">
						<p className="truncate font-medium">{notification.actor.name}</p>
						<p className="text-sm text-muted-foreground">
							{notification.actor.bio || bioEmptyLabel}
						</p>
					</div>
				</div>
				{notification.actor.website ? (
					<a
						href={notification.actor.website}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
					>
						<Globe className="size-4" />
						<span>{websiteLabel}</span>
					</a>
				) : null}
			</HoverCardContent>
		</HoverCard>
	);
}

function ArticleHoverCard({
	notification,
	articleLabel,
	missingLabel,
	children,
}: {
	notification: DashboardNotification;
	articleLabel: string;
	missingLabel: string;
	children: ReactNode;
}) {
	if (!notification.article) {
		return <span className="font-medium text-foreground">{children}</span>;
	}

	return (
		<HoverCard openDelay={120} closeDelay={120}>
			<HoverCardTrigger asChild>
				<Link
					href={
						notification.article.target_url || notification.target_url || "#"
					}
					className="font-medium text-foreground underline-offset-4 transition hover:underline"
				>
					{children}
				</Link>
			</HoverCardTrigger>
			<HoverCardContent align="start" className="w-84 space-y-3">
				{notification.article.cover_image_url ? (
					<Image
						src={notification.article.cover_image_url}
						alt={notification.article.title}
						width={336}
						height={144}
						className="h-36 w-full rounded-md object-cover"
						unoptimized
					/>
				) : (
					<div className="flex h-24 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
						{missingLabel}
					</div>
				)}
				<div className="space-y-1">
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
						{articleLabel}
					</p>
					<p className="font-medium">{notification.article.title}</p>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}

export default function DashboardNotifications() {
	const t = useTranslations("dashboard.notifications");
	const tm = useTranslations("toast.dashboard.notifications");
	const locale = useLocale();

	const [isMutating, setIsMutating] = useState(false);
	const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

	// ── labels ────────────────────────────────────────────────────────────────
	const userFallback = t("hover.userFallback");
	const userBioEmpty = t("hover.userBioEmpty");
	const userWebsiteLabel = t("hover.userWebsite");
	const articleLabel = t("hover.articleLabel");
	const articleMissing = t("hover.articleMissing");
	const commentPreviewLabel = t("hover.commentPreview");
	const markReadErrorMessage = tm("markReadError");
	const markAllReadErrorMessage = tm("markAllReadError");

	// ── message helpers (declared before hook so the toast callback can use them) ──
	function getArticleTitle(notification: DashboardNotification) {
		return (
			notification.article?.title ||
			notification.metadata.article_key?.replace(/^blog:/, "") ||
			articleMissing
		);
	}

	function getNotificationPlainMessage(notification: DashboardNotification) {
		const actorName = notification.actor.name || userFallback;
		const articleTitle = getArticleTitle(notification);
		if (notification.type === "reply")
			return t("content.replyMessage", {
				actor: actorName,
				article: articleTitle,
			});
		if (notification.type === "like")
			return t("content.likeMessage", {
				actor: actorName,
				article: articleTitle,
			});
		return notification.message || t("content.systemMessage");
	}

	// ── data + realtime ──────────────────────────────────────────────────────
	const { notifications, isLoading, loadError, reload, setNotificationState } =
		useNotificationData(tm("loadError"));

	// ── derived state ────────────────────────────────────────────────────────
	const unreadCount = useMemo(
		() => notifications.filter((n) => !n.is_read).length,
		[notifications],
	);

	const filteredNotifications = useMemo(() => {
		if (activeFilter === "all") return notifications;
		if (activeFilter === "unread")
			return notifications.filter((n) => !n.is_read);
		return notifications.filter((n) => n.type === activeFilter);
	}, [activeFilter, notifications]);

	// ── message helpers (declared before hook so the toast callback can use them) ──
	// ── action handlers ──────────────────────────────────────────────────────
	const onMarkRead = async (id: string) => {
		setIsMutating(true);
		const result = await markNotificationAsRead(id);
		if (!result.success) {
			handleError(
				new Error(result.error || markReadErrorMessage),
				markReadErrorMessage,
			);
			setIsMutating(false);
			return;
		}
		setNotificationState((prev) =>
			prev.map((item) =>
				item.id === id
					? { ...item, is_read: true, read_at: new Date().toISOString() }
					: item,
			),
		);
		setIsMutating(false);
	};

	const onMarkAllRead = async () => {
		setIsMutating(true);
		const result = await markAllNotificationsAsRead();
		if (!result.success) {
			handleError(
				new Error(result.error || markAllReadErrorMessage),
				markAllReadErrorMessage,
			);
			setIsMutating(false);
			return;
		}
		setNotificationState((prev) =>
			prev.map((item) => ({
				...item,
				is_read: true,
				read_at: item.read_at || new Date().toISOString(),
			})),
		);
		handleSuccess(tm("markAllReadSuccess"));
		setIsMutating(false);
	};

	// ── render ───────────────────────────────────────────────────────────────
	return (
		<div className="space-y-6 p-4 lg:p-6 h-[calc(100dvh-var(--header-height))]">
			<Card className="h-full flex flex-col">
				<CardHeader className="gap-3 shrink-0">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div className="space-y-1">
							<CardTitle>{t("title")}</CardTitle>
							<CardDescription>{t("description")}</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="outline">
								{t("unreadCount", { count: unreadCount })}
							</Badge>
							<Button
								variant="outline"
								size="sm"
								onClick={() => void reload(true)}
								disabled={isMutating || isLoading}
							>
								<RefreshCw className="size-4" />
								{t("actions.refresh")}
							</Button>
							<Button
								variant="default"
								size="sm"
								onClick={onMarkAllRead}
								disabled={isMutating || isLoading || unreadCount === 0}
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
				<CardContent className="space-y-3 overflow-y-auto overscroll-contain">
					{isLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 4 }).map((_, idx) => (
								<Skeleton key={idx} className="h-24 w-full rounded-lg" />
							))}
						</div>
					) : loadError ? (
						<ErrorState
							title={t("title")}
							description={loadError}
							onRetry={() => void reload(true)}
							retryLabel={t("actions.refresh")}
						/>
					) : filteredNotifications.length === 0 ? (
						<div className="rounded-lg border border-dashed p-8 text-center">
							<p className="text-sm font-medium">{t("empty.title")}</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{t("empty.description")}
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{filteredNotifications.map((notification) => {
								const Icon = getTypeIcon(notification.type);
								const actorName = notification.actor.name || userFallback;
								const articleTitle = getArticleTitle(notification);

								const message =
									notification.type === "reply" || notification.type === "like"
										? t.rich(
												notification.type === "reply"
													? "content.replyMessageRich"
													: "content.likeMessageRich",
												{
													actorName,
													articleTitle,
													actor: (chunks) => (
														<UserHoverCard
															notification={notification}
															bioEmptyLabel={userBioEmpty}
															websiteLabel={userWebsiteLabel}
														>
															{chunks}
														</UserHoverCard>
													),
													article: (chunks) => (
														<ArticleHoverCard
															notification={notification}
															articleLabel={articleLabel}
															missingLabel={articleMissing}
														>
															{chunks}
														</ArticleHoverCard>
													),
												},
											)
										: getNotificationPlainMessage(notification);

								return (
									<div
										key={notification.id}
										className="rounded-lg border bg-card p-4 shadow-xs transition-colors hover:bg-muted/40"
									>
										<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
											<div className="flex min-w-0 flex-1 gap-3">
												<Avatar size="lg" className="mt-0.5">
													{notification.actor_avatar_url ? (
														<AvatarImage
															src={notification.actor_avatar_url}
															alt={notification.actor_name}
														/>
													) : null}
													<AvatarFallback>
														{getInitials(notification.actor_name)}
													</AvatarFallback>
												</Avatar>

												<div className="min-w-0 space-y-2">
													{!notification.is_read ? (
														<Badge variant="secondary">
															{t("status.unread")}
														</Badge>
													) : null}
													<p className="text-sm leading-6 text-muted-foreground">
														{message}
													</p>
													{notification.type === "reply" &&
													notification.metadata.comment_preview ? (
														<div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
															<p className="mb-1 text-xs font-medium uppercase tracking-wide">
																{commentPreviewLabel}
															</p>
															<p className="line-clamp-3">
																{notification.metadata.comment_preview}
															</p>
														</div>
													) : null}
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<Badge
															variant={
																notification.is_read ? "outline" : "default"
															}
														>
															<Icon className="size-3" />
															{t(`types.${notification.type}`)}
														</Badge>
														<span className="text-xs text-muted-foreground">
															{getRelativeTime(locale, notification.created_at)}
														</span>
													</div>
												</div>
											</div>

											<div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
												{notification.target_url ? (
													<Button variant="outline" size="sm" asChild>
														<Link href={notification.target_url}>
															{t("actions.view")}
														</Link>
													</Button>
												) : null}
												{notification.type === "reply" ? (
													<Button variant="outline" size="sm" asChild>
														<Link href={notification.target_url || "#"}>
															{t("actions.reply")}
														</Link>
													</Button>
												) : null}
												{notification.type === "like" ? (
													<Button variant="outline" size="sm" asChild>
														<Link href={notification.target_url || "#"}>
															{t("actions.likeBack")}
														</Link>
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
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
