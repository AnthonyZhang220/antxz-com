"use client";

import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { FileText, UserRound } from "lucide-react";
import { CVProfileTabContent } from "@/components/about/cv-profile-tab-content";
import {
	CVResumeTabContent,
	type ResumeEducation,
	type ResumeExperience,
	type ResumeProject,
	type ResumeSkills,
} from "@/components/about/cv-resume-tab-content";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CVProps = {
	initialTab?: "resume" | "profile";
};

export default function CV({ initialTab = "profile" }: CVProps) {
	const t = useTranslations("about.cv");
	const tProfile = useTranslations("about.profile");
	const locale = useLocale();
	const [activeProject, setActiveProject] = useState(0);
	const [activeTab, setActiveTab] = useState<"resume" | "profile">(initialTab);
	const [resumeViewerOpen, setResumeViewerOpen] = useState(false);

	const sections = t.raw("sections") as Record<string, string>;
	const experience = t.raw("experience") as ResumeExperience[];
	const education = t.raw("education") as ResumeEducation[];
	const skills = t.raw("skills") as ResumeSkills;
	const projects = t.raw("projects") as ResumeProject[];
	const introParagraphs = [
		tProfile("intro.paragraph1"),
		tProfile("intro.paragraph2"),
	];
	const focusItems = [
		tProfile("focus.frontend"),
		tProfile("focus.fullstack"),
		tProfile("focus.product"),
	];
	const valueItems = [
		tProfile("values.ownership"),
		tProfile("values.consistency"),
		tProfile("values.learning"),
	];

	const currentResumePdf =
		locale === "zh" ? "/resume-zh.pdf" : "/resume-en.pdf";

	return (
		<main className="relative overflow-hidden px-4 py-10 md:px-8">
			<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(34,197,94,0.16),transparent_38%),radial-gradient(circle_at_85%_0%,rgba(14,165,233,0.16),transparent_32%),linear-gradient(to_bottom,transparent,rgba(15,23,42,0.03))]" />

			<motion.div
				initial={{ opacity: 0, y: 28 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="mx-auto w-full max-w-6xl space-y-8"
			>
				<section className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/75 md:p-8">
					<div className="flex flex-wrap items-start justify-between gap-3 md:gap-4">
						<h1 className="text-3xl font-bold tracking-tight md:text-5xl">
							{activeTab === "resume" ? t("title") : tProfile("title")}
						</h1>
						{activeTab === "resume" ? (
							<div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
								<Button size="sm" variant="secondary" disabled>
									{t("viewResume")}
								</Button>
								<Button size="sm" disabled>
									{t("downloadEN")}
								</Button>
								<Button size="sm" variant="outline" disabled>
									{t("downloadZH")}
								</Button>
								<Button size="sm" variant="ghost" disabled>
									{t("openInNewTab")}
								</Button>
							</div>
						) : null}
					</div>
					<p className="mt-3 max-w-3xl text-base text-slate-700 dark:text-slate-300 md:text-lg">
						{activeTab === "resume" ? t("subtitle") : tProfile("subtitle")}
					</p>

					<Tabs
						value={activeTab}
						onValueChange={(value) =>
							setActiveTab(value as "resume" | "profile")
						}
						className="mt-6"
					>
						<TabsList variant="default">
							<TabsTrigger value="profile" className="px-5 text-base">
								<UserRound className="h-5 w-5" />
								{t("tabs.profile")}
							</TabsTrigger>
							<TabsTrigger value="resume" className="px-5 text-base">
								<FileText className="h-5 w-5" />
								{t("tabs.resume")}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="resume" className="mt-6">
							<CVResumeTabContent
								resumeViewerOpen={resumeViewerOpen}
								setResumeViewerOpen={setResumeViewerOpen}
								currentResumePdf={currentResumePdf}
								viewerTitle={t("pdfPreviewTitle")}
								viewerHint={t("pdfPreviewHint")}
								closeViewerLabel={t("closeViewer")}
								summary={t("summary")}
								sections={sections}
								experience={experience}
								education={education}
								skills={skills}
								projects={projects}
								activeProject={activeProject}
								setActiveProject={setActiveProject}
							/>
						</TabsContent>

						<TabsContent value="profile" className="mt-6">
							<CVProfileTabContent
								chips={{
									role: tProfile("chips.role"),
									stack: tProfile("chips.stack"),
									location: tProfile("chips.location"),
								}}
								focusItems={focusItems}
								introTitle={tProfile("intro.title")}
								introParagraphs={introParagraphs}
								valuesTitle={tProfile("values.title")}
								valueItems={valueItems}
								contactTitle={t("contactTitle")}
								contactDescription={t("contactDescription")}
								nextActions={{
									blog: tProfile("next.actions.blog"),
									projects: tProfile("next.actions.projects"),
								}}
								locale={locale}
							/>
						</TabsContent>
					</Tabs>
				</section>
			</motion.div>
		</main>
	);
}
