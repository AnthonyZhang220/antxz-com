"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useScroll, useTransform, motion } from "motion/react";
import type { Transition } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";

const SPRING: Transition = { type: "spring", stiffness: 55, damping: 16 };
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function reveal(i: number, opts?: { x?: number; y?: number }) {
	return {
		initial: { opacity: 0, x: opts?.x ?? 0, y: opts?.y ?? 24 },
		whileInView: { opacity: 1, x: 0, y: 0 },
		viewport: { once: true, margin: "-40px" as const },
		transition: {
			duration: 0.65,
			delay: i * 0.09,
			ease: EASE,
		} satisfies Transition,
	};
}

const ROTATE_OFFSETS = [-3, 2, -1, 3, -2];

export default function Intro() {
	const t = useTranslations("home");
	const sectionRef = useRef<HTMLElement>(null);

	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start end", "end start"],
	});

	const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
	const imageRotate = useTransform(scrollYProgress, [0, 1], [-1, 1]);
	const bgNumY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

	const stackTags = t("introStack")
		.split("·")
		.map((s) => s.trim());

	return (
		<section
			ref={sectionRef}
			id="intro"
			className="relative w-full overflow-x-clip"
		>
			{/* GIANT BACKGROUND "01" */}
			<motion.div
				className="pointer-events-none absolute right-0 top-0 select-none"
				style={{ y: bgNumY }}
				aria-hidden
			>
				<span
					className="block font-black leading-none text-zinc-900 opacity-[0.04] dark:text-white dark:opacity-[0.05]"
					style={{ fontSize: "28vw" }}
				>
					01
				</span>
			</motion.div>

			<div className="mx-auto flex w-full max-w-375 min-h-[74vh] flex-col px-3 sm:px-4 md:min-h-168 md:flex-row md:items-stretch md:px-6 lg:min-h-184 lg:px-8">
				{/* PHOTO */}
				<motion.div
					className="relative shrink-0 md:w-[min(40vw,34rem)] md:self-stretch lg:w-[min(36vw,36rem)]"
					initial={{ opacity: 0, x: -80, rotate: -8 }}
					whileInView={{ opacity: 1, x: 0, rotate: -4 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={SPRING}
					whileHover={{ rotate: -1, scale: 1.01 }}
					style={{ transformOrigin: "center 80%" }}
				>
					<motion.div
						className="relative aspect-4/5 w-full max-h-136 overflow-hidden shadow-[12px_0_48px_-4px_rgba(0,0,0,0.25)] md:aspect-auto md:h-full md:min-h-168 md:max-h-none dark:shadow-[12px_0_48px_-4px_rgba(0,0,0,0.55)]"
						style={{ y: imageY, rotate: imageRotate }}
					>
						<Image
							src="/profile-image.jpg"
							alt="Anthony Zhang"
							fill
							sizes="(max-width: 768px) 100vw, 45vw"
							className="object-cover object-[center_24%] md:object-[center_18%] lg:object-[center_20%]"
							priority
						/>
						<div className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-transparent to-background/20" />
					</motion.div>

					<motion.span
						{...reveal(6, { x: -20 })}
						className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-widest text-white/60"
					>
						© 2025
					</motion.span>
				</motion.div>

				{/* CONTENT */}
				<div className="relative flex flex-1 flex-col justify-center gap-8 px-6 py-8 md:px-9 md:py-10 lg:px-12 lg:py-12">
					{/* TOP: eyebrow */}
					<motion.div
						{...reveal(0, { y: -16 })}
						className="flex items-center gap-4 self-start"
					>
						<span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400">
							{t("introRole")}
						</span>
						<span className="h-px w-10 bg-zinc-300 dark:bg-zinc-700" />
						<span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400">
							<MapPin className="size-2.5" />
							{t("introLocation")}
						</span>
					</motion.div>

					{/* MIDDLE: title */}
					<div className="-ml-1 self-start md:-ml-2 lg:-ml-4">
						<div className="overflow-hidden">
							<motion.h2
								initial={{ y: "108%", opacity: 0 }}
								whileInView={{ y: "0%", opacity: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, ease: EASE }}
								className="font-black uppercase leading-[0.88] tracking-tight"
								style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}
							>
								{t("introTitleLine1")}
							</motion.h2>
						</div>

						<div className="flex items-center gap-4">
							<div className="overflow-hidden">
								<motion.h2
									initial={{ y: "108%", opacity: 0 }}
									whileInView={{ y: "0%", opacity: 1 }}
									viewport={{ once: true }}
									transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
									className="font-black uppercase italic leading-[0.88] tracking-tight text-zinc-300 dark:text-zinc-600"
									style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}
								>
									{t("introTitleLine2")}
								</motion.h2>
							</div>

							<motion.div
								initial={{ opacity: 0, scale: 0, rotate: -15 }}
								whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.45, delay: 0.55, ease: EASE }}
								className="group relative shrink-0"
							>
								{/* Animated background glow on hover */}
								<div className="pointer-events-none absolute inset-0 -m-2 rounded-full bg-zinc-900/0 shadow-[0_0_20px_rgba(24,24,27,0)] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(24,24,27,0.3)] dark:shadow-[0_0_20px_rgba(244,244,245,0)] dark:group-hover:shadow-[0_0_20px_rgba(244,244,245,0.2)]" />

								<Link
									href={`//about/me`}
									className="relative flex items-center justify-center border-2 border-zinc-900 transition-all duration-200 hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:hover:bg-white dark:hover:text-zinc-900"
									style={{
										width: "clamp(2.5rem, 4.5vw, 4rem)",
										height: "clamp(2.5rem, 4.5vw, 4rem)",
									}}
									title={t("introCta")}
									aria-label={t("introCta")}
								>
									<motion.div
										animate={{ x: [0, 4, 0] }}
										transition={{
											duration: 2,
											repeat: Infinity,
											repeatDelay: 1,
										}}
									>
										<ArrowRight
											className="transition-transform duration-200"
											style={{
												width: "clamp(1rem, 2vw, 1.5rem)",
												height: "clamp(1rem, 2vw, 1.5rem)",
											}}
										/>
									</motion.div>
								</Link>

								{/* Optional: Animated label on hover */}
								<motion.span
									initial={{ opacity: 0, y: 8 }}
									whileHover={{ opacity: 1, y: 0 }}
									className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-400"
								>
									{t("introCta")}
								</motion.span>
							</motion.div>
						</div>
					</div>

					{/* BOTTOM: bio left, stack right */}
					<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
						<motion.p
							{...reveal(3, { x: -16 })}
							className="max-w-[28ch] text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
						>
							{t("introBody")}
						</motion.p>

						<motion.ul
							{...reveal(4)}
							className="flex list-none flex-wrap justify-end gap-x-3 gap-y-2 p-0 md:max-w-[24ch]"
						>
							{stackTags.map((tag, idx) => (
								<motion.li
									key={tag}
									initial={{
										opacity: 0,
										y: 10,
										rotate: ROTATE_OFFSETS[idx % ROTATE_OFFSETS.length],
									}}
									whileInView={{ opacity: 1, y: 0, rotate: 0 }}
									viewport={{ once: true }}
									transition={{
										duration: 0.4,
										delay: 0.2 + idx * 0.07,
										ease: EASE,
									}}
									whileHover={{ scale: 1.1, rotate: idx % 2 === 0 ? -2 : 2 }}
									className={
										idx === 0
											? "list-none bg-zinc-900 px-2.5 py-1 text-xs font-bold tracking-wider text-white dark:bg-white dark:text-zinc-900"
											: "list-none text-xs font-medium tracking-wide text-zinc-400 dark:text-zinc-500"
									}
								>
									{tag}
								</motion.li>
							))}
						</motion.ul>
					</div>
				</div>
			</div>

			{/* BOTTOM RULE */}
			<motion.div
				initial={{ scaleX: 0 }}
				whileInView={{ scaleX: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 1.2, ease: EASE }}
				style={{ transformOrigin: "left" }}
				className="h-px w-full bg-zinc-200 dark:bg-zinc-800"
			/>
		</section>
	);
}
