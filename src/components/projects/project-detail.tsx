import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import {
	ArrowLeft,
	Calendar,
	ExternalLink,
	Github,
	Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectItem } from "@/types/project";
import type { ProjectLabels } from "@/components/projects/projects-showcase";

type ProjectDetailProps = {
	project: ProjectItem;
	locale: string;
	labels: ProjectLabels;
};

export function ProjectDetail({ project, locale, labels }: ProjectDetailProps) {
	const backPath = `/${locale}/projects`;
	const firstScreenshot = project.screenshots?.[0];
	const remainingScreenshots = project.screenshots?.slice(1) ?? [];

	return (
		<main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 lg:px-10">
			<div className="mb-8">
				<Button variant="ghost" size="sm" asChild className="-ml-2">
					<Link href={backPath}>
						<ArrowLeft className="mr-1 h-4 w-4" />
						{labels.allProjects}
					</Link>
				</Button>
			</div>

			<div className="space-y-8">
				<div className="space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						{project.featured ? <Badge>{labels.featured}</Badge> : null}
						{project.isNew ? <Badge variant="secondary">{labels.new}</Badge> : null}
						{project.publishedAt ? (
							<Badge variant="outline" className="gap-1">
								<Calendar className="h-3.5 w-3.5" />
								{new Date(project.publishedAt).toLocaleDateString(locale)}
							</Badge>
						) : null}
					</div>

					<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
						{project.title}
					</h1>
					{project.subtitle ? (
						<p className="text-lg text-muted-foreground">{project.subtitle}</p>
					) : null}
					{project.introduction ? (
						<p className="text-base text-muted-foreground">{project.introduction}</p>
					) : null}

					<div className="flex flex-wrap gap-2 pt-1">
						{project.websiteUrl ? (
							<Button asChild>
								<Link href={project.websiteUrl} target="_blank" rel="noopener noreferrer">
									{labels.liveSite}
									<ExternalLink className="ml-1 h-4 w-4" />
								</Link>
							</Button>
						) : null}
						{project.githubUrl ? (
							<Button variant="outline" asChild>
								<Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
									{labels.sourceCode}
									<Github className="ml-1 h-4 w-4" />
								</Link>
							</Button>
						) : null}
					</div>
				</div>

				{project.coverImage?.url ? (
					<div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-muted">
						<Image
							src={project.coverImage.url}
							alt={project.coverImage.alt || project.title}
							fill
							priority
							className="object-cover"
						/>
					</div>
				) : null}

				{project.screenshots?.length ? (
					<div>
						<h2 className="mb-3 text-xl font-semibold">{labels.screenshots}</h2>
						<div className="space-y-3">
							{firstScreenshot?.url ? (
								<div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
									<Image
										src={firstScreenshot.url}
										alt={firstScreenshot.alt || `${project.title} screenshot 1`}
										fill
										className="object-cover"
									/>
								</div>
							) : null}

							{remainingScreenshots.length ? (
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{remainingScreenshots.map((image, index) => (
										<div
											key={`${project.slug}-shot-${index + 1}`}
											className="relative aspect-16/10 overflow-hidden rounded-xl border bg-muted"
										>
											{image.url ? (
												<Image
													src={image.url}
													alt={image.alt || `${project.title} screenshot ${index + 2}`}
													fill
													className="object-cover"
												/>
											) : null}
										</div>
									))}
								</div>
							) : null}
						</div>
					</div>
				) : null}

				<div className="grid gap-6 lg:grid-cols-12">
					<div className="space-y-6 lg:col-span-8">
						<Card>
							<CardHeader>
								<CardTitle>{labels.overview}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="leading-7 text-muted-foreground">{project.overview}</p>
							</CardContent>
						</Card>

						{project.features?.length ? (
							<Card>
								<CardHeader>
									<CardTitle>{labels.keyFeatures}</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{project.features.map((feature) => (
										<div key={`${project.slug}-${feature.name}`} className="space-y-1">
											<p className="font-medium">{feature.name}</p>
											<p className="text-sm leading-6 text-muted-foreground">
												{feature.detail}
											</p>
										</div>
									))}
								</CardContent>
							</Card>
						) : null}

						{project.body && project.body.length ? (
							<Card>
								<CardHeader>
									<CardTitle>
										<Sparkles className="mr-2 inline h-5 w-5" />
										{labels.details}
									</CardTitle>
								</CardHeader>
								<CardContent className="prose prose-zinc max-w-none dark:prose-invert">
									<PortableText
										value={project.body as Parameters<typeof PortableText>[0]["value"]}
									/>
								</CardContent>
							</Card>
						) : null}

					</div>

					<div className="space-y-4 lg:col-span-4">
						{project.roles?.length ? (
							<Card>
								<CardHeader>
									<CardTitle>{labels.roles}</CardTitle>
								</CardHeader>
								<CardContent className="flex flex-wrap gap-2">
									{project.roles.map((role) => (
										<Badge key={role} variant="secondary">
											{role}
										</Badge>
									))}
								</CardContent>
							</Card>
						) : null}

						{project.libraries?.length ? (
							<Card>
								<CardHeader>
									<CardTitle>{labels.libraries}</CardTitle>
								</CardHeader>
								<CardContent className="flex flex-wrap gap-2">
									{project.libraries.map((item) => (
										<Badge key={item} variant="outline" className="text-xs">
											{item}
										</Badge>
									))}
								</CardContent>
							</Card>
						) : null}

						{project.process ? (
							<Card>
								<CardHeader>
									<CardTitle>{labels.process}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-6 text-muted-foreground">{project.process}</p>
								</CardContent>
							</Card>
						) : null}

						{project.challenges ? (
							<Card>
								<CardHeader>
									<CardTitle>{labels.challenges}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-6 text-muted-foreground">{project.challenges}</p>
								</CardContent>
							</Card>
						) : null}

						{project.results ? (
							<Card>
								<CardHeader>
									<CardTitle>{labels.results}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-6 text-muted-foreground">{project.results}</p>
								</CardContent>
							</Card>
						) : null}
					</div>
				</div>
			</div>
		</main>
	);
}
