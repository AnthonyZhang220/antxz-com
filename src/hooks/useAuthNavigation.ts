"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
	finishLoadingError,
	finishLoadingSuccess,
	startLoading,
} from "@/lib/errors/error-utils";

export type UseAuthNavigationResult = {
	locale: string;
	authHref: string;
	homeHref: string;
	accountHref: string;
	dashboardHref: string;
	handleLogout: () => Promise<void>;
};

export function useAuthNavigation(
	signOut: () => Promise<void>
): UseAuthNavigationResult {
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations();

	const authHref = useMemo(() => `/${locale}/auth/login`, [locale]);
	const homeHref = useMemo(() => `/${locale}`, [locale]);
	const accountHref = useMemo(() => `/${locale}/dashboard/account`, [locale]);
	const dashboardHref = useMemo(() => `/${locale}/dashboard`, [locale]);

	const handleLogout = useCallback(async () => {
		const toastId = startLoading(t("toast.auth.logout.loading"));
		try {
			await signOut();
			finishLoadingSuccess(toastId, t("toast.auth.logout.success"));
			router.push(homeHref);
		} catch (error: unknown) {
			finishLoadingError(
				toastId,
				error instanceof Error && error.message
					? error.message
					: t("toast.auth.logout.error")
			);
		}
	}, [homeHref, router, signOut, t]);

	return {
		locale,
		authHref,
		homeHref,
		accountHref,
		dashboardHref,
		handleLogout,
	};
}
