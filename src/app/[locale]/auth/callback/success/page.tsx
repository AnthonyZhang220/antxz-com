"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { AuthLanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeSync } from "@/components/shared/theme-sync";

function normalizeNextPath(next: string | null) {
	if (!next || !next.startsWith("/") || next.startsWith("//")) {
		return "/dashboard"; // next-intl 的 router 会自动加 locale
	}
	return next;
}

export default function AuthCallbackSuccessPage() {
	const t = useTranslations("auth.callback");
	const router = useRouter();
	const searchParams = useSearchParams();
	const nextPath = normalizeNextPath(searchParams.get("next"));

	useEffect(() => {
		window.location.href = nextPath;
	}, [nextPath, router]);

	return (
		<div className="flex min-h-screen items-center justify-center px-6">
			<div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
				<ThemeSync />
				<Link
					href="/"
					aria-label="ANTXZ"
					className="mb-1 inline-flex items-center gap-3"
				>
					<Image
						src="/logo.svg"
						alt="ANTXZ"
						width={1024}
						height={672}
						className="h-10 w-auto dark:invert"
						priority
					/>
					<span className="font-montserrat text-xl font-semibold tracking-[0.08em] text-foreground">
						ANTXZ
					</span>
				</Link>
				<div className="mb-1">
					<AuthLanguageSwitcher />
				</div>
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
				<h1 className="text-lg font-semibold">{t("title")}</h1>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>
		</div>
	);
}
