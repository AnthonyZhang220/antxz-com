"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
	finishLoadingError,
	finishLoadingSuccess,
	startLoading,
} from "@/lib/errors/error-utils";

export type UseAuthNavigationResult = {
	authHref: string;
	homeHref: string;
	accountHref: string;
	dashboardHref: string;
	notificationsHref: string;
	handleLogout: () => Promise<void>;
};

export function useAuthNavigation(
	signOut: () => Promise<void>,
): UseAuthNavigationResult {
	const router = useRouter();
	const t = useTranslations();

	const authHref = "/auth/login";
	const homeHref = "/";
	const accountHref = "/dashboard/account";
	const dashboardHref = "/dashboard";
	const notificationsHref = "/dashboard/notifications";

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
					: t("toast.auth.logout.error"),
			);
		}
	}, [homeHref, router, signOut, t]);

	return {
		authHref,
		homeHref,
		accountHref,
		dashboardHref,
		handleLogout,
		notificationsHref,
	};
}
