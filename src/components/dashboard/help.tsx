"use client";

import { ArrowUpRight, Bug, Lightbulb, Mail, SearchCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const supportCardKeys = [
	{
		titleKey: "dashboard.help.cards.email.title",
		descriptionKey: "dashboard.help.cards.email.description",
		badgeKey: "dashboard.help.cards.email.badge",
		icon: Mail,
		href: "mailto:you@example.com?subject=AntXZ%20Support",
		ctaKey: "dashboard.help.cards.email.cta",
		pointsKey: "dashboard.help.cards.email.points",
	},
	{
		titleKey: "dashboard.help.cards.issue.title",
		descriptionKey: "dashboard.help.cards.issue.description",
		badgeKey: "dashboard.help.cards.issue.badge",
		icon: Bug,
		href: "https://github.com/AnthonyZhang220/antxz-com/issues/new",
		ctaKey: "dashboard.help.cards.issue.cta",
		pointsKey: "dashboard.help.cards.issue.points",
	},
	{
		titleKey: "dashboard.help.cards.feature.title",
		descriptionKey: "dashboard.help.cards.feature.description",
		badgeKey: "dashboard.help.cards.feature.badge",
		icon: Lightbulb,
		href: "https://github.com/AnthonyZhang220/antxz-com/issues/new?title=Feature%20request%3A%20",
		ctaKey: "dashboard.help.cards.feature.cta",
		pointsKey: "dashboard.help.cards.feature.points",
	},
	{
		titleKey: "dashboard.help.cards.browse.title",
		descriptionKey: "dashboard.help.cards.browse.description",
		badgeKey: "dashboard.help.cards.browse.badge",
		icon: SearchCheck,
		href: "https://github.com/AnthonyZhang220/antxz-com/issues",
		ctaKey: "dashboard.help.cards.browse.cta",
		pointsKey: "dashboard.help.cards.browse.points",
	},
];

export function Help() {
	const t = useTranslations();

	return (
		<div className="flex flex-1 flex-col">
			<div className="@container/main flex flex-1 flex-col gap-2">
				<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
					<div className="px-4 lg:px-6">
						<h2 className="text-lg font-semibold">
							{t("dashboard.help.title")}
						</h2>
						<p className="mt-1 max-w-2xl text-sm text-muted-foreground">
							{t("dashboard.help.subtitle")}
						</p>
					</div>
					<div className="grid grid-cols-1 gap-5 px-4 lg:grid-cols-2 lg:px-6">
						{supportCardKeys.map((cardKey) => {
							const Icon = cardKey.icon;
							const points: string[] = t.raw(cardKey.pointsKey);

							return (
								<Card
									key={cardKey.titleKey}
									className="min-h-80 justify-between bg-linear-to-br from-primary/10 via-card to-card shadow-xs"
								>
									<CardHeader className="gap-3">
										<CardAction>
											<Badge variant="outline" className="gap-1.5">
												<Icon className="size-3.5" />
												{t(cardKey.badgeKey)}
											</Badge>
										</CardAction>
										<CardDescription>
											{t(cardKey.descriptionKey)}
										</CardDescription>
										<CardTitle className="text-2xl leading-tight">
											{t(cardKey.titleKey)}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<ul className="space-y-3 text-sm text-muted-foreground">
											{points.map((point) => (
												<li key={point} className="flex gap-2">
													<span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/70" />
													<span>{point}</span>
												</li>
											))}
										</ul>
									</CardContent>
									<CardFooter className="items-end justify-between gap-4">
										<p className="max-w-xs text-sm text-muted-foreground">
											{t("dashboard.help.footer")}
										</p>
										<Button asChild size="lg">
											<a
												href={cardKey.href}
												target="_blank"
												rel="noopener noreferrer"
											>
												{t(cardKey.ctaKey)}
												<ArrowUpRight />
											</a>
										</Button>
									</CardFooter>
								</Card>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
