"use server";

import {
	getAuthenticatedUserSettings,
	saveUserPreferences,
} from "@/lib/user-preferences-service";
import type { UserSettings } from "@/lib/user-preferences";

/**
 * Read dashboard user settings.
 */
export async function getUserSettings() {
	return getAuthenticatedUserSettings();
}

/**
 * Save dashboard user settings.
 */
export async function saveUserSettings(settings: Partial<UserSettings>) {
	return saveUserPreferences(settings, { requireAuth: true });
}
