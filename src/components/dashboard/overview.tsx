"use client";

import { useEffect, useState, useMemo } from "react";
import { Bell, Heart, MessageSquare, MessagesSquare } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AccountProfile } from "@/lib/actions/account-actions";
import { cn } from "@/lib/utils";

type OverviewStats = {
	totalComments: number;
	likesReceived: number;
	unreadNotifications: number;
	totalNotifications: number;
};

async function fetchOverviewStats(userId: string): Promise<OverviewStats> {
	const supabase = createClient();

	// Step 1: get user's comment IDs
	const { data: userComments } = await supabase
		.from("comments")
		.select("id")
		.eq("user_id", userId);

	const commentIds = (userComments ?? []).map((c) => c.id);
	const totalComments = commentIds.length;

	// Step 2: count likes on those comments
	let likesReceived = 0;
	if (commentIds.length > 0) {
		const { count } = await supabase
			.from("comment_likes")
			.select("comment_id", { count: "exact", head: true })
			.in("comment_id", commentIds);
		likesReceived = count ?? 0;
	}

	// Step 3: notifications
	const { data: allNotifs } = await supabase
		.from("notifications")
		.select("is_read")
		.eq("user_id", userId);

	const totalNotifications = (allNotifs ?? []).length;
	const unreadNotifications = (allNotifs ?? []).filter(
		(n) => !n.is_read,
	).length;

	return {
		totalComments,
		likesReceived,
		unreadNotifications,
		totalNotifications,
	};
}

export function Overview({ user }: { user: AccountProfile }) {
	const tCard = useTranslations("dashboard.overview.cards");
	const tAccount = useTranslations("dashboard.overview.account");
	const [stats, setStats] = useState<OverviewStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const format = useFormatter();

	useEffect(() => {
		const supabase = createClient();
		void supabase.auth.getUser().then(({ data }) => {
			if (data.user) {
				void fetchOverviewStats(data.user.id).then((stats) => {
					setStats(stats);
					setIsLoading(false);
				});
			}
		});
	}, []);

	const cards = [
		{
			key: "totalComments" as const,
			icon: MessageSquare,
			value: stats?.totalComments,
			url: "/dashboard/comments",
		},
		{
			key: "likesReceived" as const,
			icon: Heart,
			value: stats?.likesReceived,
			url: "/dashboard/likes",
		},
		{
			key: "unreadNotifications" as const,
			icon: Bell,
			value: stats?.unreadNotifications,
		},
		{
			key: "totalNotifications" as const,
			icon: MessagesSquare,
			value: stats?.totalNotifications,
		},
	];

	const accountFields = [
		{
			label: tAccount("fields.provider"),
			value: user.provider || "-",
		},
		{
			label: tAccount("fields.memberSince"),
			value: user.created_at
				? format.dateTime(new Date(user.created_at), {
						dateStyle: "medium",
					})
				: "-",
		},
		{
			label: tAccount("fields.lastSignIn"),
			value: user.last_sign_in_at
				? format.dateTime(new Date(user.last_sign_in_at), {
						dateStyle: "medium",
					})
				: "-",
		},
	];

	const initials = useMemo(() => {
		const source = user.full_name || user.email;
		if (!source) {
			return "U";
		}

		const parts = source.trim().split(/\s+/);
		return (parts[0]?.[0] || "U").toUpperCase();
	}, [user.email, user.full_name]);

	return (
		<section className="space-y-6 p-4 lg:p-6">
			{isLoading ? (
				<Card>
					<CardContent className="space-y-6">
						<div className="flex items-center gap-4">
							<Skeleton className="h-12 w-12 rounded-full" />
							<div className="space-y-1">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							<Skeleton className="h-6 w-full md:col-span-1" />
							<Skeleton className="h-6 w-full md:col-span-1" />
							<Skeleton className="h-6 w-full md:col-span-1" />
						</div>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent className="space-y-6">
						<div className="flex items-center gap-4">
							<Avatar size="lg" className="size-16">
								{user.avatar_url ? (
									<AvatarImage
										src={user.avatar_url}
										alt={user.full_name || user.email}
									/>
								) : (
									<AvatarFallback>{initials}</AvatarFallback>
								)}
							</Avatar>
							<div className="space-y-1">
								<p className="font-medium">
									{user.full_name || tAccount("fields.noName")}
								</p>
								<p className="text-sm text-muted-foreground">{user.email}</p>
							</div>
						</div>
						<div className="grid gap-4 grid-cols-2 md:grid-cols-3">
							{accountFields.map((field) => (
								<div
									key={field.label}
									className="space-y-1 md:border-r md:pr-4"
								>
									<p className="text-xs text-muted-foreground">{field.label}</p>
									<p className="text-sm font-medium capitalize">
										{field.value}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
			<article className="grid grid-cols-2 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
				{cards.map(({ key, icon: Icon, value }) => (
					<Card key={key} className="@container/card">
						<CardHeader>
							<CardDescription className="flex items-center gap-2">
								<Icon className="size-4 text-muted-foreground" />
								{tCard(`${key}.label`)}
							</CardDescription>
							<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								{stats === null ? (
									<Skeleton className="h-6 w-12 rounded" />
								) : (
									(value?.toLocaleString() ?? "0")
								)}
							</CardTitle>
						</CardHeader>
						<CardFooter className="text-sm">
							<div className="text-muted-foreground">
								{tCard(`${key}.description`)}
							</div>
						</CardFooter>
					</Card>
				))}
			</article>
		</section>
	);
}
