"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { getCookie } from "@/lib/shared/cookies";

function subscribe() {
	// cookie 不会主动触发变化事件，这里返回一个空的取消订阅函数即可
	return () => {};
}

function getSnapshot() {
	return getCookie("preferred_region") || "global";
}

function getServerSnapshot() {
	// 服务端渲染时统一返回默认值，和客户端首次渲染保持一致
	return "global";
}

export default function GlobeButton() {
	const t = useTranslations("languageRegion");
	const locale = useLocale();

	const region = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);

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
