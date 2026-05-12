"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Linkedin, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { GitHubIcon } from "../shared/github-icon";

type CVProfileTabContentProps = {
	chips: {
		role: string;
		stack: string;
		location: string;
	};
	focusItems: string[];
	introTitle: string;
	introParagraphs: string[];
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
				<div className="relative mt-5 flex flex-wrap gap-2">
					{focusItems.map((item, index) => (
						<motion.div
							key={item}
							initial={{ opacity: 0, y: 14 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.35, delay: index * 0.06 }}
							whileHover={{ y: -2 }}
							className="rounded-full border border-cyan-200/70 bg-white/80 px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm dark:border-cyan-900/60 dark:bg-slate-900/70 sm:text-sm"
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
							<CardContent className="space-y-4">
								<Accordion
									type="single"
									collapsible
									className="rounded-lg border border-slate-200/70 bg-background/70 px-3 dark:border-slate-700/70"
								>
									<AccordionItem value="intro">
										<AccordionTrigger className="text-sm font-semibold tracking-wide text-foreground sm:text-base">
											{introTitle}
										</AccordionTrigger>
										<AccordionContent>
											<ul className="space-y-2 text-sm leading-6 text-muted-foreground sm:text-base">
												{introParagraphs.map((paragraph, idx) => (
													<li key={`${paragraph.slice(0, 24)}-${idx}`}>
														{paragraph}
													</li>
												))}
											</ul>
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="principles">
										<AccordionTrigger className="text-sm font-semibold tracking-wide text-foreground sm:text-base">
											{valuesTitle}
										</AccordionTrigger>
										<AccordionContent>
											<ul className="space-y-2 text-sm leading-6 text-muted-foreground sm:text-base">
												{valueItems.map((item) => (
													<li key={item}>{item}</li>
												))}
											</ul>
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</CardContent>
						</Card>
					</motion.div>
				</div>

				<div className="space-y-4 lg:col-span-4">
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
								<p className="text-sm leading-6 text-muted-foreground">
									{contactDescription}
								</p>
								<div className="grid gap-2">
									<Button
										asChild
										size="sm"
										variant="outline"
										className="justify-start transition-transform hover:-translate-y-0.5"
									>
										<Link href="mailto:hi@antxz.com">
											<Mail className="mr-2 h-4 w-4" /> hi@antxz.com
										</Link>
									</Button>
									<Button
										asChild
										size="sm"
										variant="outline"
										className="justify-start transition-transform hover:-translate-y-0.5"
									>
										<Link
											href="https://github.com/AnthonyZhang220"
											target="_blank"
											rel="noopener noreferrer"
										>
											<GitHubIcon className="mr-2 h-4 w-4" /> GitHub
										</Link>
									</Button>
									<Button
										asChild
										size="sm"
										variant="outline"
										className="justify-start transition-transform hover:-translate-y-0.5"
									>
										<Link
											href="https://www.linkedin.com/in/anthony-xiangyu-zhang/"
											target="_blank"
											rel="noopener noreferrer"
										>
											<Linkedin className="mr-2 h-4 w-4" /> LinkedIn
										</Link>
									</Button>
								</div>
								<Separator />
								<div className="flex flex-wrap gap-2">
									<Button
										asChild
										size="sm"
										className="transition-transform hover:-translate-y-0.5"
									>
										<Link href={`/${locale}/blog`}>{nextActions.blog}</Link>
									</Button>
									<Button
										asChild
										size="sm"
										variant="outline"
										className="transition-transform hover:-translate-y-0.5"
									>
										<Link href={`/${locale}/projects`}>
											{nextActions.projects}
										</Link>
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
