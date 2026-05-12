"use server";

import { saveUserPreferences } from "@/lib/user/preferences-service";
import { AppLocale, AppRegion } from "@/lib/user/preferences";

/**
 * Save user locale/region preferences.
 */
export async function savePreferences(locale: AppLocale, region: AppRegion) {
	return saveUserPreferences({ locale, region });
}
