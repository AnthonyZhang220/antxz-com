"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Hero() {
	const t = useTranslations("home");
	const motto = t("motto");
	const mottoWords = motto
		.replace(/[.。]$/, "")
		.split(/[,，]/)
		.map((word) => word.trim())
		.filter(Boolean);
	const mottoLines = mottoWords.map((word, idx) =>
		`${word}${idx < mottoWords.length - 1 ? "," : "."}`,
	);
	const lineOffsets = mottoLines.map((_, idx) =>
		mottoLines
			.slice(0, idx)
			.reduce((sum, line) => sum + line.length, 0),
	);
	const underlineBaseDelayMs = mottoLines.length * 220 + 260;

	return (
		<section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
			{/* Professional Background */}
			<div className="absolute inset-0 bg-linear-to-b from-zinc-50 to-zinc-100 dark:from-slate-950 dark:to-slate-900" />
			<div
				className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
				style={{
					backgroundImage:
						"radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05) 1px,transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(96,165,250,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(196,181,253,0.15),transparent_50%)]" />

			<div className="relative z-10 flex w-full max-w-6xl flex-col items-center justify-center px-4 py-24 sm:px-8 md:py-32">
				<div className="motto-stage inline-flex flex-col items-start">
					{mottoLines.map((line, idx) => (
						<div
							key={idx}
							className="flex flex-col items-start"
							style={{ marginLeft: `${lineOffsets[idx]}ch` }}
						>
							<span
								className="motto-line block font-mono text-4xl font-bold leading-none tracking-normal text-zinc-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white"
								style={{ animationDelay: `${idx * 220}ms` }}
							>
								{line}
							</span>
							<span
								className="motto-underline-step mt-2 block h-px bg-zinc-700/70 dark:bg-zinc-300/80"
								style={{
									width: `${line.length + 0.2}ch`,
									animationDelay: `${underlineBaseDelayMs + idx * 180}ms`,
								}}
							/>
						</div>
					))}
				</div>

				<Link
					href="#intro"
					className="mt-10 rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
				>
					{t("aboutMeButton")}
				</Link>
			</div>
		</section>
	);
}
