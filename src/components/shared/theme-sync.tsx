"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { getCookie } from "@/lib/shared/cookies";

export function ThemeSync() {
	const { setTheme } = useTheme();

	useEffect(() => {
		const theme = getCookie("preferred_theme");
		if (theme) setTheme(theme);
	}, [setTheme]);

	return null;
}
