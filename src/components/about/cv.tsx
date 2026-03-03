"use client";

import { useTranslations } from "next-intl";

export default function CV() {
	const t = useTranslations("about.cv");

	return (
		<main>
			<h1 className="text-4xl">{t("title")}</h1>
			<span className="text-lg">{t("subtitle")}</span>
		</main>
	);
}
