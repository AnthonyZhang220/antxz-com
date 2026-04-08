"use server";

import { saveUserPreferences } from "@/lib/user-preferences-service";

/**
 * Save user locale/region preferences.
 */
export async function savePreferences(locale: string, region: string) {
	return saveUserPreferences({ locale, region });
}
