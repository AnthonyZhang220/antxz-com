"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { getCookie } from "@/lib/cookies";

export default function GlobeButton() {
	const t = useTranslations("languageRegion");
	const savedRegion = getCookie("preferred_region");
	const savedLocale = getCookie("preferred_locale");

	return (
		<Link href="/preferences">
			<Button variant="ghost">
				<Globe className="h-4 w-4" />
				<span>{t(`region.${savedRegion}`)}</span>
				{"/"}
				<span>{t(`language.${savedLocale}`)}</span>
			</Button>
		</Link>
	);
}
