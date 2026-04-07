"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export type UseAuthNavigationResult = {
	locale: string;
	authHref: string;
	homeHref: string;
	profileHref: string;
	dashboardHref: string;
	handleLogout: () => Promise<void>;
};

export function useAuthNavigation(
	signOut: () => Promise<void>
): UseAuthNavigationResult {
	const router = useRouter();
	const locale = useLocale();

	const authHref = useMemo(() => `/${locale}/auth/login`, [locale]);
	const homeHref = useMemo(() => `/${locale}`, [locale]);
	const profileHref = useMemo(() => `/${locale}/about/me`, [locale]);
	const dashboardHref = useMemo(() => `/${locale}/dashboard`, [locale]);

	const handleLogout = useCallback(async () => {
		await signOut();
		router.push(homeHref);
	}, [signOut, router, homeHref]);

	return {
		locale,
		authHref,
		homeHref,
		profileHref,
		dashboardHref,
		handleLogout,
	};
}
