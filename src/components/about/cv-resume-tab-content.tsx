"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

export type ResumeExperience = {
	company: string;
	role: string;
	type: string;
	period: string;
	tech: string[];
	highlights: string[];
};

export type ResumeEducation = {
	school: string;
	degree: string;
	period: string;
	location: string;
};

export type ResumeSkillGroup = {
	label: string;
	items: string[];
};

export type ResumeSkills = Record<string, ResumeSkillGroup>;

export type ResumeProject = {
	name: string;
	type: string;
	period: string;
	tech: string[];
	highlights: string[];
};

type CVResumeTabContentProps = {
	resumeViewerOpen: boolean;
	setResumeViewerOpen: (open: boolean) => void;
	currentResumePdf: string;
	viewerTitle: string;
	viewerHint: string;
	closeViewerLabel: string;
	summary: string;
	sections: Record<string, string>;
	experience: ResumeExperience[];
	education: ResumeEducation[];
	skills: ResumeSkills;
	projects: ResumeProject[];
	activeProject: number;
	setActiveProject: (index: number) => void;
};

export function CVResumeTabContent({
	resumeViewerOpen,
	setResumeViewerOpen,
	currentResumePdf,
	viewerTitle,
	viewerHint,
	closeViewerLabel,
	summary,
	sections,
	experience,
	education,
	skills,
	projects,
	activeProject,
	setActiveProject,
}: CVResumeTabContentProps) {
	return (
		<div className="space-y-8">
			<Sheet open={resumeViewerOpen} onOpenChange={setResumeViewerOpen}>
				<SheetContent side="top" className="h-screen w-screen max-w-none p-0">
					<SheetHeader className="border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-6">
						<div className="flex items-start justify-between gap-3">
							<div>
								<SheetTitle>{viewerTitle}</SheetTitle>
								<SheetDescription>{viewerHint}</SheetDescription>
							</div>
							<SheetClose asChild>
								<Button size="icon" variant="ghost" aria-label={closeViewerLabel}>
									<X className="h-4 w-4" />
								</Button>
							</SheetClose>
						</div>
					</SheetHeader>
					<div className="h-[calc(100vh-88px)] w-full">
						<iframe title={viewerTitle} src={currentResumePdf} className="h-full w-full" />
					</div>
				</SheetContent>
			</Sheet>

			<motion.section
				initial={{ opacity: 0, y: 18 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{ duration: 0.45 }}
				className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/20"
			>
				<h2 className="text-xl font-semibold md:text-2xl">{sections.summary}</h2>
				<p className="mt-3 leading-7 text-slate-700 dark:text-slate-200">{summary}</p>
			</motion.section>

			<section className="grid gap-6 lg:grid-cols-3">
				<motion.div
					initial={{ opacity: 0, x: -16 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, amount: 0.25 }}
					transition={{ duration: 0.4 }}
					className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
				>
					<h2 className="text-xl font-semibold">{sections.experience}</h2>
					{experience.map((item) => (
						<div key={`${item.company}-${item.period}`} className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/50">
							<p className="text-sm font-medium text-slate-500">{item.period}</p>
							<h3 className="mt-1 text-lg font-bold">{item.role}</h3>
							<p className="text-sm text-slate-600 dark:text-slate-300">{item.company} · {item.type}</p>
							<div className="mt-3 flex flex-wrap gap-2">
								{item.tech.map((tech) => (
									<span key={tech} className="rounded-full border border-slate-300 px-2 py-1 text-xs dark:border-slate-600">
										{tech}
									</span>
								))}
							</div>
							<ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-300">
								{item.highlights.map((point) => (
									<li key={point}>{point}</li>
								))}
							</ul>
						</div>
					))}
				</motion.div>

				<div className="space-y-6 lg:col-span-2">
					<motion.div
						initial={{ opacity: 0, x: 16 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.25 }}
						transition={{ duration: 0.4 }}
						className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
					>
						<h2 className="text-xl font-semibold">{sections.education}</h2>
						<div className="mt-4 space-y-3">
							{education.map((item) => (
								<div key={`${item.school}-${item.period}`} className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-700">
									<p className="text-sm font-medium text-slate-500">{item.period}</p>
									<h3 className="mt-1 text-lg font-bold">{item.school}</h3>
									<p className="text-sm text-slate-700 dark:text-slate-300">{item.degree}</p>
									<p className="text-sm text-slate-500">{item.location}</p>
								</div>
							))}
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.4 }}
						className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
					>
						<h2 className="text-xl font-semibold">{sections.skills}</h2>
						<div className="mt-4 grid gap-4 sm:grid-cols-2">
							{Object.entries(skills).map(([key, group]) => (
								<motion.div
									key={key}
									whileHover={{ y: -2 }}
									className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
								>
									<h3 className="font-semibold">{group.label}</h3>
									<div className="mt-2 flex flex-wrap gap-2">
										{group.items.map((item) => (
											<span key={item} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
												{item}
											</span>
										))}
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				</div>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 md:p-8">
				<h2 className="text-2xl font-semibold">{sections.projects}</h2>
				<div className="mt-5 grid gap-3 md:grid-cols-2">
					{projects.map((project, index) => {
						const isActive = activeProject === index;

						return (
							<motion.button
								key={`${project.name}-${project.period}`}
								onClick={() => setActiveProject(index)}
								whileHover={{ y: -2 }}
								className={`rounded-xl border p-4 text-left transition ${
									isActive
										? "border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-900/30"
										: "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
								}`}
							>
								<p className="text-sm text-slate-500">{project.period}</p>
								<h3 className="mt-1 font-semibold">{project.name}</h3>
								<p className="text-sm text-slate-600 dark:text-slate-300">{project.type}</p>
							</motion.button>
						);
					})}
				</div>

				<AnimatePresence mode="wait">
					{projects[activeProject] ? (
						<motion.div
							key={`${projects[activeProject].name}-${activeProject}`}
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -12 }}
							transition={{ duration: 0.25 }}
							className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/40"
						>
							<div className="flex flex-wrap gap-2">
								{projects[activeProject].tech.map((tech) => (
									<span key={tech} className="rounded-full border border-slate-300 px-2 py-1 text-xs dark:border-slate-600">
										{tech}
									</span>
								))}
							</div>
							<ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-300">
								{projects[activeProject].highlights.map((point) => (
									<li key={point}>{point}</li>
								))}
							</ul>
						</motion.div>
					) : null}
				</AnimatePresence>
			</section>
		</div>
	);
}
