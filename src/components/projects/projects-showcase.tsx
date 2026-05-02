import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Github } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ProjectItem } from "@/types/project";
import { useTranslations } from "next-intl";

export interface ProjectLabels {
	title: string;
	subtitle: string;
	viewDetails: string;
	overview: string;
	keyFeatures: string;
	roles: string;
	libraries: string;
	process: string;
	challenges: string;
	results: string;
	screenshots: string;
	allProjects: string;
	details: string;
	liveSite: string;
	sourceCode: string;
	featured: string;
	new: string;
	emptyTitle: string;
	emptyDescription: string;
	openStudio: string;
}

type ProjectsShowcaseProps = {
	projects: ProjectItem[];
	locale: string;
	labels: ProjectLabels;
};

export function ProjectsShowcase({
	projects,
	locale,
	labels,
}: ProjectsShowcaseProps) {
	const t = useTranslations("project");
	const getPreviewText = (project: ProjectItem) => {
		const source =
			project.introduction?.trim() || project.overview?.trim() || "";
		if (source.length <= 150) {
			return source;
		}

		return `${source.slice(0, 147)}...`;
	};

	if (projects.length === 0) {
		return (
			<main className="mx-auto min-h-[70vh] w-full max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
				<div className="rounded-2xl border bg-card p-8 text-center">
					<h1 className="text-3xl font-semibold tracking-tight">
						{labels.title}
					</h1>
					<p className="mt-2 text-muted-foreground">{labels.subtitle}</p>
					<Separator className="mx-auto my-6 max-w-md" />
					<p className="text-lg font-medium">{labels.emptyTitle}</p>
					<p className="mt-2 text-sm text-muted-foreground">
						{labels.emptyDescription}
					</p>
					<Button asChild className="mt-6">
						<Link href="/studio">{labels.openStudio}</Link>
					</Button>
				</div>
			</main>
		);
	}

	return (
		<main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
			{/* Header */}
			<div className="mb-10">
				<p className="font-mono text-sm md:text-base uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">
					{t("projectCount", { count: projects.length })}
				</p>
				<h1 className="font-serif text-6xl font-bold text-foreground tracking-tight leading-none">
					{labels.title}
				</h1>
				<p className="mt-2 text-muted-foreground">{labels.subtitle}</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{projects.map((project) => {
					const detailsPath = `/${locale}/projects/${project.slug}`;
					const previewText = getPreviewText(project);
					const screenshotCount = project.screenshots?.length || 0;

					return (
						<Card key={project._id ?? project.id} className="overflow-hidden">
							<div
								className={`relative ${"aspect-video"} w-full border-b bg-muted`}
							>
								{project.coverImage?.url ? (
									<Image
										src={project.coverImage.url}
										alt={project.coverImage.alt || project.title}
										fill
										className="object-cover"
									/>
								) : null}
							</div>

							<CardHeader className="space-y-3">
								<div className="flex flex-wrap items-center gap-2">
									{project.featured ? <Badge>{labels.featured}</Badge> : null}
									{project.isNew ? (
										<Badge variant="secondary">{labels.new}</Badge>
									) : null}
									{project.screenshots?.length ? (
										<Badge variant="outline" className="text-xs">
											{screenshotCount} {labels.screenshots}
										</Badge>
									) : null}
									{project.tags?.slice(0, 3).map((tag) => (
										<Badge key={tag} variant="outline" className="text-xs">
											{tag}
										</Badge>
									))}
								</div>
								<CardTitle className="text-2xl">{project.title}</CardTitle>
								{project.subtitle ? (
									<p className="text-sm text-muted-foreground">
										{project.subtitle}
									</p>
								) : null}
								{previewText ? (
									<p className="text-sm leading-6 text-muted-foreground">
										{previewText}
									</p>
								) : null}
							</CardHeader>

							<CardFooter className="flex items-center gap-2 pt-0">
								<Button asChild>
									<Link href={detailsPath}>
										{labels.viewDetails}
										<ArrowRight className="ml-1 h-4 w-4" />
									</Link>
								</Button>
								{project.websiteUrl ? (
									<Button variant="ghost" size="icon" asChild>
										<Link
											href={project.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink className="h-4 w-4" />
											<span className="sr-only">{labels.liveSite}</span>
										</Link>
									</Button>
								) : null}
								{project.githubUrl ? (
									<Button variant="ghost" size="icon" asChild>
										<Link
											href={project.githubUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Github className="h-4 w-4" />
											<span className="sr-only">{labels.sourceCode}</span>
										</Link>
									</Button>
								) : null}
							</CardFooter>
						</Card>
					);
				})}
			</div>
		</main>
	);
}
