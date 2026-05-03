"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ProfileSection = {
	key: string;
	title: string;
	content: string;
};

type CVProfileTabContentProps = {
	chips: {
		role: string;
		stack: string;
		location: string;
	};
	focusItems: string[];
	introTitle: string;
	introParagraphs: string[];
	profileSections: ProfileSection[];
	valuesTitle: string;
	valueItems: string[];
	contactTitle: string;
	contactDescription: string;
	nextActions: {
		blog: string;
		projects: string;
	};
	locale: string;
};

export function CVProfileTabContent({
	chips,
	focusItems,
	introTitle,
	introParagraphs,
	profileSections,
	valuesTitle,
	valueItems,
	contactTitle,
	contactDescription,
	nextActions,
	locale,
}: CVProfileTabContentProps) {
	return (
		<div className="space-y-6">
			<motion.section
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.2 }}
				transition={{ duration: 0.45 }}
				className="relative overflow-hidden rounded-2xl border border-cyan-200/70 bg-linear-to-br from-cyan-50 via-white to-sky-100 p-6 dark:border-cyan-900/70 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/40 md:p-8"
			>
				<div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-700/20" />
				<div className="pointer-events-none absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-sky-300/25 blur-2xl dark:bg-sky-700/20" />
				<div className="relative flex flex-wrap gap-2">
					<motion.div whileHover={{ y: -2 }}>
						<Badge>{chips.role}</Badge>
					</motion.div>
					<motion.div whileHover={{ y: -2 }}>
						<Badge variant="secondary">{chips.stack}</Badge>
					</motion.div>
					<motion.div whileHover={{ y: -2 }}>
						<Badge variant="outline">{chips.location}</Badge>
					</motion.div>
				</div>
				<div className="relative mt-5 grid gap-3 sm:grid-cols-3">
					{focusItems.map((item, index) => (
						<motion.div
							key={item}
							initial={{ opacity: 0, y: 14 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.35, delay: index * 0.06 }}
							whileHover={{ y: -4, scale: 1.01 }}
							className="rounded-xl border border-cyan-200/70 bg-white/80 p-3 text-sm shadow-sm backdrop-blur-sm dark:border-cyan-900/60 dark:bg-slate-900/70"
						>
							{item}
						</motion.div>
					))}
				</div>
			</motion.section>

			<section className="grid gap-6 lg:grid-cols-12">
				<div className="space-y-6 lg:col-span-8">
					<motion.div
						initial={{ opacity: 0, x: -18 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.42 }}
					>
						<Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-700">
							<CardHeader>
								<CardTitle>{introTitle}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
								{introParagraphs.map((paragraph) => (
									<p key={paragraph}>{paragraph}</p>
								))}
							</CardContent>
						</Card>
					</motion.div>

					<div className="grid gap-4 sm:grid-cols-3">
						{profileSections.map((section, index) => (
							<motion.div
								key={section.key}
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.25 }}
								transition={{ duration: 0.34, delay: index * 0.07 }}
								whileHover={{ y: -6 }}
							>
								<Card className="rounded-2xl border-slate-200 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700">
									<CardHeader>
										<CardTitle className="text-lg">{section.title}</CardTitle>
									</CardHeader>
									<CardContent className="text-sm leading-6 text-muted-foreground">
										{section.content}
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>

				<div className="space-y-4 lg:col-span-4">
					<motion.div
						initial={{ opacity: 0, x: 18 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.38 }}
					>
						<Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-700">
							<CardHeader>
								<CardTitle>{valuesTitle}</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm leading-6 text-muted-foreground">
									{valueItems.map((item) => (
										<motion.li key={item} whileHover={{ x: 4 }}>
											{item}
										</motion.li>
									))}
								</ul>
							</CardContent>
						</Card>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 18 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.42, delay: 0.05 }}
					>
						<Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-700">
							<CardHeader>
								<CardTitle>{contactTitle}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm leading-6 text-muted-foreground">{contactDescription}</p>
								<div className="grid gap-2">
									<Button asChild size="sm" variant="outline" className="justify-start transition-transform hover:-translate-y-0.5">
										<Link href="mailto:hi@antxz.com"><Mail className="mr-2 h-4 w-4" /> hi@antxz.com</Link>
									</Button>
									<Button asChild size="sm" variant="outline" className="justify-start transition-transform hover:-translate-y-0.5">
										<Link href="https://github.com/AnthonyZhang220" target="_blank" rel="noopener noreferrer"><Github className="mr-2 h-4 w-4" /> GitHub</Link>
									</Button>
									<Button asChild size="sm" variant="outline" className="justify-start transition-transform hover:-translate-y-0.5">
										<Link href="https://www.linkedin.com/in/anthony-xiangyu-zhang/" target="_blank" rel="noopener noreferrer"><Linkedin className="mr-2 h-4 w-4" /> LinkedIn</Link>
									</Button>
								</div>
								<Separator />
								<div className="flex flex-wrap gap-2">
									<Button asChild size="sm" className="transition-transform hover:-translate-y-0.5">
										<Link href={`/${locale}/blog`}>{nextActions.blog}</Link>
									</Button>
									<Button asChild size="sm" variant="outline" className="transition-transform hover:-translate-y-0.5">
										<Link href={`/${locale}/projects`}>{nextActions.projects}</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</section>
		</div>
	);
}
