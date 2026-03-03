"use client";

import { useTranslations } from "next-intl";

export default function Me() {
	const t = useTranslations("about.me");
	return (
		<main>
			<div>
				<h1 className="text-4xl">{t("title")}</h1>
				<span className="text-lg">{t("subtitle")}</span>
			</div>
		</main>
	);
}
