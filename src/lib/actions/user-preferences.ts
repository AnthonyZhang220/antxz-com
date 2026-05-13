"use server";

import { saveUserPreferences } from "@/lib/user/preferences-actions";
import { AppTheme } from "@/lib/user/preferences";
import { AppLocale, AppRegion } from "@/lib/user/preferences";

/**
 * Sync theme selection to cookies and user settings.
 */
export async function saveThemePreference(theme: AppTheme) {
	return await saveUserPreferences({ theme });
}

/**
 * Save user locale/region preferences.
 */
export async function savePreferences(locale: AppLocale, region: AppRegion) {
	return await saveUserPreferences({ locale, region });
}
