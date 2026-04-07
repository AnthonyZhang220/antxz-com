"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
	const t = useTranslations();

	return (
		<div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>
						{t("dashboard.overview.cards.totalRevenue.label")}
					</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{t("dashboard.overview.cards.totalRevenue.value")}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<TrendingUp />
							{t("dashboard.overview.cards.totalRevenue.trend")}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{t("dashboard.overview.cards.totalRevenue.trendingUp")}
						<TrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">
						{t("dashboard.overview.cards.totalRevenue.description")}
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>
						{t("dashboard.overview.cards.newCustomers.label")}
					</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{t("dashboard.overview.cards.newCustomers.value")}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<TrendingDown />
							{t("dashboard.overview.cards.newCustomers.trend")}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{t("dashboard.overview.cards.newCustomers.trendingDown")}
						<TrendingDown className="size-4" />
					</div>
					<div className="text-muted-foreground">
						{t("dashboard.overview.cards.newCustomers.description")}
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>
						{t("dashboard.overview.cards.activeAccounts.label")}
					</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{t("dashboard.overview.cards.activeAccounts.value")}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<TrendingUp />
							{t("dashboard.overview.cards.activeAccounts.trend")}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{t("dashboard.overview.cards.activeAccounts.trendingUp")}
						<TrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">
						{t("dashboard.overview.cards.activeAccounts.description")}
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>
						{t("dashboard.overview.cards.growthRate.label")}
					</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{t("dashboard.overview.cards.growthRate.value")}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<TrendingUp />
							{t("dashboard.overview.cards.growthRate.trend")}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{t("dashboard.overview.cards.growthRate.trendingUp")}
						<TrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">
						{t("dashboard.overview.cards.growthRate.description")}
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
