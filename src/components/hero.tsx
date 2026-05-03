"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useWaterRipple } from "@/hooks";
import { Button } from "./ui/button";

// ==================== Hero Component ====================
export default function Hero() {
	const t = useTranslations("home");
	const locale = useLocale();
	const isZh = locale === "zh";

	const glowRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const mousePos = useRef({ x: 0, y: 0 });

	// Initialize water ripple effect
	const { addRipple } = useWaterRipple(canvasRef);

	// Reverse parallax on background glow (外境在动，本心常静).
	// Text is positionally locked via separate ref.
	const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
		mousePos.current = { x: e.clientX, y: e.clientY };

		// Trigger ripple effect
		addRipple(e.clientX, e.clientY);

		if (!glowRef.current) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const xPct = (e.clientX - rect.left) / rect.width - 0.5;
		const yPct = (e.clientY - rect.top) / rect.height - 0.5;
		// Negate direction → reverse; keep magnitude small (±12px / ±8px)
		glowRef.current.style.transform = `translate(${-xPct * 12}px, ${-yPct * 8}px)`;
	};

	// Scroll → Gaussian blur on text only, no displacement
	useEffect(() => {
		const el = textRef.current;
		if (!el) return;
		const onScroll = () => {
			const blur = Math.min(window.scrollY / 55, 10);
			el.style.filter = blur > 0 ? `blur(${blur}px)` : "";
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// ---------- Chinese motto ----------
	// "常应常静，常清静矣。"
	// Parse dynamically from i18n key to stay DRY.
	const mottoZh = t("mottoZh");
	const zhParts = mottoZh.replace(/[。]$/, "").split(/[，,]/);
	const zhLine1Body = zhParts[0] ?? ""; // "常应常静"
	// Chars 0-1 = "常应" (bold); chars 2+ = "常静" (thin)
	const zhBold = zhLine1Body.slice(0, 2);
	const zhThin = zhLine1Body.slice(2);
	const zhLine2Body = zhParts.slice(1).join("") || ""; // "常清静矣"

	// ---------- English motto ----------
	// "Constantly responding, constantly still, always pure and still."
	const mottoEn = t("mottoEn");
	const enRaw = mottoEn.replace(/\.$/, "");
	const enSegs = enRaw.split(", ");
	const enLine1 = (enSegs[0] ?? "") + ","; // "Constantly responding,"
	const enLine2 = (enSegs[1] ?? "") + ","; // "constantly still,"
	const enLine3 = (enSegs[2] ?? "") + "."; // "always pure and still."

	// Split line 1 at " responding" for shimmer underline
	const hl1Idx = enLine1.indexOf(" responding");
	const enL1Pre = hl1Idx >= 0 ? enLine1.slice(0, hl1Idx + 1) : enLine1; // "Constantly "
	const enL1Hl = hl1Idx >= 0 ? enLine1.slice(hl1Idx + 1) : ""; // "responding,"

	return (
		<section
			className="relative flex min-h-svh w-full items-center overflow-hidden"
			onMouseMove={handleMouseMove}
		>
			{/* Canvas particle system — follows mouse with ripple effect */}
			<canvas
				ref={canvasRef}
				className="pointer-events-none absolute inset-0 -z-20"
			/>

			{/* Background glow — moves in reverse to mouse; text does not */}
			<div
				ref={glowRef}
				className="pointer-events-none absolute left-[42%] top-[38%] -z-10 h-130 w-140 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/15 blur-[90px] transition-transform duration-600 ease-out dark:bg-sky-500/18"
			/>
			<div className="pointer-events-none absolute bottom-8 right-8 -z-10 h-56 w-56 rounded-full bg-indigo-200/10 blur-3xl dark:bg-indigo-600/12" />

			<div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-12 sm:gap-10 sm:px-8 sm:py-16 md:gap-9 md:px-8 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:gap-8 lg:px-6 lg:py-16 xl:grid-cols-[1fr_320px] xl:gap-12 xl:px-8">
				{/* Left column — motto + ghost buttons (blur only on scroll, position locked) */}
				<div
					ref={textRef}
					className="flex w-full flex-col items-center will-change-[filter] lg:items-start lg:w-auto"
					style={{ textRendering: "geometricPrecision" }}
				>
					{isZh ? (
						/* ── Chinese motto ── */
						<div className="motto-stage mb-7 flex flex-col items-center md:mb-8 lg:items-start">
							{/* Line 1: "常应"(bold) + "常静"(thin) + "，"(low opacity) */}
							<div className="mb-4 flex flex-col items-center lg:items-start">
								<p
									className="font-mono text-5xl leading-none text-zinc-900 sm:text-6xl md:text-6xl lg:text-8xl dark:text-white"
									style={{ textRendering: "geometricPrecision" }}
								>
									<span
										className="font-black inline-block pb-1"
										style={{
											boxShadow: "0 3px 0 -2px rgb(14 165 233)",
											animation: "breathing-shadow 3s ease-in-out infinite",
										}}
									>
										{zhBold}
									</span>
									<span className="font-thin">{zhThin}</span>
									<span className="font-thin" style={{ opacity: 0.45 }}>
										，
									</span>
								</p>
							</div>

							{/* Line 2: "常清静矣。" thin + slight indent */}
							<div className="ml-[2ch]">
								<p
									className="motto-line font-mono text-5xl font-thin leading-none text-zinc-900 sm:text-6xl md:text-6xl lg:text-8xl dark:text-white"
									style={{
										animationDelay: "240ms",
										textRendering: "geometricPrecision",
									}}
								>
									{zhLine2Body}
									<span style={{ opacity: 0.45 }}>。</span>
								</p>
							</div>
						</div>
					) : (
						/* ── English motto ── staggered indent + opacity cascade */
						<div
							className="motto-stage mb-7 flex w-full max-w-full flex-col items-center sm:w-auto md:mb-8 lg:items-start"
							style={{ textRendering: "geometricPrecision" }}
						>
							{/* Line 1 — 100% opacity, no indent */}
							<p
								className="motto-line whitespace-nowrap font-mono text-[1.55rem] font-semibold leading-snug tracking-[-0.015em] text-zinc-900 sm:text-[2.1rem] md:text-[2.2rem] md:tracking-[-0.01em] lg:text-[2.8rem] xl:text-5xl dark:text-white"
								style={{
									animationDelay: "0ms",
									textRendering: "geometricPrecision",
								}}
							>
								{enL1Pre}
								<span className="relative inline-block">
									{enL1Hl}
									{/* Gradient shimmer underline */}
									<span className="underline-flow absolute -bottom-1 left-0 h-[1.5px] w-full" />
								</span>
							</p>

							{/* Line 2 — 85% opacity, indent 2ch */}
							<p
								className="motto-line ml-[0.8ch] whitespace-nowrap font-mono text-[1.5rem] font-light leading-snug tracking-[-0.015em] text-zinc-900/85 sm:ml-[1.6ch] sm:text-[2rem] md:ml-[1.2ch] md:text-[2.1rem] md:tracking-[-0.01em] lg:ml-[2ch] lg:text-[2.7rem] xl:text-5xl dark:text-white/85"
								style={{
									animationDelay: "180ms",
									textRendering: "geometricPrecision",
								}}
							>
								{enLine2}
							</p>

							{/* Line 3 — 70% opacity, indent 4ch */}
							<p
								className="motto-line ml-[1.4ch] whitespace-nowrap font-mono text-[1.45rem] font-light leading-snug tracking-[-0.015em] text-zinc-900/70 sm:ml-[2.8ch] sm:text-[1.9rem] md:ml-[2.2ch] md:text-[2rem] md:tracking-[-0.01em] lg:ml-[4ch] lg:text-[2.6rem] xl:text-5xl dark:text-white/70"
								style={{
									animationDelay: "360ms",
									textRendering: "geometricPrecision",
								}}
							>
								{enLine3}
							</p>
						</div>
					)}

					{/* Ghost buttons — transparent fill, thin border */}
					<div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start lg:gap-3.5">
						<Button variant="default" asChild>
							<Link href="/blog">{t("blogButton")}</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/about/me">{t("aboutMeButton")}</Link>
						</Button>
					</div>
				</div>

				{/* Right — Contact card */}
				<div className="relative mx-auto w-full max-w-88 rounded-xl border border-zinc-300/80 bg-white/85 p-4 shadow-sm backdrop-blur-sm sm:max-w-md sm:p-5 md:max-w-lg md:rounded-2xl md:p-6 dark:border-zinc-700 dark:bg-zinc-900/80 lg:mt-2 lg:mx-0 lg:max-w-none lg:p-5">
					<div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-sky-200/40 blur-2xl dark:bg-sky-500/20" />
					<p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500 dark:text-zinc-400 sm:text-xs sm:tracking-[0.16em]">
						{t("contactLabel")}
					</p>
					<h3 className="mt-2 text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
						{t("contactTitle")}
					</h3>
					<p className="mt-1 text-[13px] leading-5 text-zinc-600 sm:text-sm sm:leading-6 dark:text-zinc-300">
						{t("contactBody")}
					</p>
					<Button
						variant="outline"
						asChild
						size="default"
						className="mt-4 h-10 border-zinc-300 bg-white/90 px-3.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-white sm:h-11 sm:px-4 sm:text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
					>
						<Link href="mailto:hi@antxz.com">hi@antxz.com</Link>
					</Button>
					<p className="mt-3 text-[11px] text-zinc-500 sm:text-xs dark:text-zinc-400">
						{t("contactReplyEta")}
					</p>
				</div>
			</div>
		</section>
	);
}
