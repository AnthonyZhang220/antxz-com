"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Me() {
	const t = useTranslations("about.me");

	return (
		<main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
			<section className="relative overflow-hidden rounded-3xl border bg-card p-8 sm:p-10">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.10),transparent_55%)]" />
				<div className="relative space-y-5">
					<div className="flex flex-wrap gap-2">
						<Badge>{t("title")}</Badge>
						<Badge variant="secondary">UI Scaffold</Badge>
						<Badge variant="outline">Editable</Badge>
					</div>
					<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h1>
					<p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
						This page intentionally keeps only layout blocks so you can add your own content.
					</p>
					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-xl border bg-background/80 p-3 text-sm text-muted-foreground">Focus block 1</div>
						<div className="rounded-xl border bg-background/80 p-3 text-sm text-muted-foreground">Focus block 2</div>
						<div className="rounded-xl border bg-background/80 p-3 text-sm text-muted-foreground">Focus block 3</div>
					</div>
				</div>
			</section>

			<section className="mt-8 grid gap-6 lg:grid-cols-12">
				<div className="space-y-6 lg:col-span-8">
					<Card>
						<CardHeader>
							<CardTitle>Section 1</CardTitle>
						</CardHeader>
						<CardContent className="text-sm leading-7 text-muted-foreground sm:text-base">
							Content placeholder.
						</CardContent>
					</Card>

					<div className="grid gap-4 sm:grid-cols-3">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Section 2</CardTitle>
							</CardHeader>
							<CardContent className="text-sm leading-6 text-muted-foreground">
								Content placeholder.
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Section 3</CardTitle>
							</CardHeader>
							<CardContent className="text-sm leading-6 text-muted-foreground">
								Content placeholder.
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Section 4</CardTitle>
							</CardHeader>
							<CardContent className="text-sm leading-6 text-muted-foreground">
								Content placeholder.
							</CardContent>
						</Card>
					</div>

					<Separator />
				</div>

				<div className="space-y-4 lg:col-span-4">
					<Card>
						<CardHeader>
							<CardTitle>Sidebar</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm leading-6 text-muted-foreground">Content placeholder.</p>
						</CardContent>
					</Card>
				</div>
			</section>
		</main>
	);
}
