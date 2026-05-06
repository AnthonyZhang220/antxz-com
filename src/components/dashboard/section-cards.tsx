"use client";

import { useEffect, useState } from "react";
import { Bell, Heart, MessageSquare, MessagesSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

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
	const unreadNotifications = (allNotifs ?? []).filter((n) => !n.is_read).length;

	return { totalComments, likesReceived, unreadNotifications, totalNotifications };
}

export function SectionCards() {
	const t = useTranslations("dashboard.overview.cards");
	const [stats, setStats] = useState<OverviewStats | null>(null);

	useEffect(() => {
		const supabase = createClient();
		void supabase.auth.getUser().then(({ data }) => {
			if (data.user) {
				void fetchOverviewStats(data.user.id).then(setStats);
			}
		});
	}, []);

	const cards = [
		{
			key: "totalComments" as const,
			icon: MessageSquare,
			value: stats?.totalComments,
		},
		{
			key: "likesReceived" as const,
			icon: Heart,
			value: stats?.likesReceived,
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

	return (
		<div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
			{cards.map(({ key, icon: Icon, value }) => (
				<Card key={key} className="@container/card">
					<CardHeader>
						<CardDescription className="flex items-center gap-2">
							<Icon className="size-4 text-muted-foreground" />
							{t(`${key}.label`)}
						</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							{stats === null ? (
								<Skeleton className="h-8 w-16 rounded" />
							) : (
								value?.toLocaleString() ?? "0"
							)}
						</CardTitle>
					</CardHeader>
					<CardFooter className="text-sm">
						<div className="text-muted-foreground">{t(`${key}.description`)}</div>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
