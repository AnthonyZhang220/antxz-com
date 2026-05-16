"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { getCookie } from "@/lib/shared/cookies";

export default function GlobeButton() {
	const t = useTranslations("languageRegion");
	const locale = useLocale();
	const region = getCookie("preferred_region") || "global";

	return (
		<Link href={"/preferences"} className="ml-2">
			<Button variant="ghost">
				<Globe className="h-4 w-4" />
				<span>{t(`region.${region}`)}</span>
				{"/"}
				<span>{t(`language.${locale}`)}</span>
			</Button>
		</Link>
	);
}
