"use server";

import { saveUserPreferences } from "@/lib/user-preferences-service";

/**
 * Sync theme selection to cookies and user settings.
 */
export async function saveThemePreference(theme: string) {
	return saveUserPreferences({ theme });
}
