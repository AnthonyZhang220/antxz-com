"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { getCookie } from "@/lib/cookies";

const REGION_OPTIONS = ["us", "cn", "global"] as const;
const LOCALE_OPTIONS = ["en", "zh"] as const;
const subscribe = () => () => undefined;
const getServerRegionSnapshot = () => null;
const getServerLocaleSnapshot = () => null;

export default function GlobeButton() {
	const t = useTranslations("languageRegion");
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const savedRegion = useSyncExternalStore(
		subscribe,
		() => getCookie("preferred_region"),
		getServerRegionSnapshot,
	);
	const savedLocale = useSyncExternalStore(
		subscribe,
		() => getCookie("preferred_locale"),
		getServerLocaleSnapshot,
	);

	const region = REGION_OPTIONS.includes(savedRegion as (typeof REGION_OPTIONS)[number])
		? savedRegion
		: "global";
	const locale = LOCALE_OPTIONS.includes(savedLocale as (typeof LOCALE_OPTIONS)[number])
		? savedLocale
		: "en";
	const queryString = searchParams.toString();
	const currentPath = pathname ?? "/";
	const redirectPath = queryString ? `${currentPath}?${queryString}` : currentPath;
	const preferencesHref = `/preferences?redirect=${encodeURIComponent(redirectPath)}`;

	return (
		<Link href={preferencesHref}>
			<Button variant="ghost">
				<Globe className="h-4 w-4" />
				<span>{t(`region.${region}`)}</span>
				{"/"}
				<span>{t(`language.${locale}`)}</span>
			</Button>
		</Link>
	);
}
