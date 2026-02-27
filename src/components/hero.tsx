"use client";

import { useTranslations } from "next-intl";

export default function Hero() {
	const t = useTranslations("home");
	return (
		<section className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-black">
			<div className="flex flex-col items-center justify-center gap-6 px-4 py-32 text-center sm:px-8">
				<h1 className="max-w-3xl text-4xl font-bold tracking-tight text-black dark:text-white sm:text-5xl md:text-6xl">
					{t("hero_title")}
				</h1>
				<p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl">
					{t("hero_subtitle")}
				</p>
			</div>
		</section>
	);
}
