"use server";

import { saveUserPreferences } from "@/lib/user/preferences-service";
import { AppTheme } from "../user-preferences";

/**
 * Sync theme selection to cookies and user settings.
 */
export async function saveThemePreference(theme: AppTheme ) {
	return saveUserPreferences({ theme });
}
