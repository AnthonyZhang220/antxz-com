"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";

function normalizeNextPath(next: string | null, locale: string) {
	if (!next) {
		return `/${locale}/dashboard`;
	}

	if (!next.startsWith("/") || next.startsWith("//")) {
		return `/${locale}/dashboard`;
	}

	return next;
}

export default function AuthCallbackSuccessPage() {
	const t = useTranslations("auth.callback");
	const locale = useLocale();
	const router = useRouter();
	const searchParams = useSearchParams();
	const nextPath = normalizeNextPath(searchParams.get("next"), locale);

	useEffect(() => {
		router.replace(nextPath);
	}, [nextPath, router]);

	return (
		<div className="flex min-h-screen items-center justify-center px-6">
			<div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
				<h1 className="text-lg font-semibold">{t("title")}</h1>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>
		</div>
	);
}
