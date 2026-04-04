"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { getCookie } from "@/lib/cookies";

const REGION_OPTIONS = ["us", "cn", "global"] as const;
const LOCALE_OPTIONS = ["en", "zh"] as const;

export default function GlobeButton() {
	const t = useTranslations("languageRegion");
	const savedRegion = getCookie("preferred_region");
	const savedLocale = getCookie("preferred_locale");

	const region = REGION_OPTIONS.includes(savedRegion as (typeof REGION_OPTIONS)[number])
		? savedRegion
		: "global";
	const locale = LOCALE_OPTIONS.includes(savedLocale as (typeof LOCALE_OPTIONS)[number])
		? savedLocale
		: "en";

	return (
		<Link href="/preferences">
			<Button variant="ghost">
				<Globe className="h-4 w-4" />
				<span>{t(`region.${region}`)}</span>
				{"/"}
				<span>{t(`language.${locale}`)}</span>
			</Button>
		</Link>
	);
}
