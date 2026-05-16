"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { usePreferences } from "@/hooks/usePreferences";
import { useLocale } from "next-intl";

export default function GlobeButton() {
	const t = useTranslations("languageRegion");
	const { preferences } = usePreferences();
	const locale = useLocale();

	return (
		<Link href={"/preferences"} className="ml-2">
			<Button variant="ghost">
				<Globe className="h-4 w-4" />
				<span>{t(`region.${preferences.region}`)}</span>
				{"/"}
				<span>{t(`language.${locale}`)}</span>
			</Button>
		</Link>
	);
}
