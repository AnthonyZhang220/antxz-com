"use server";

import {
	resolveUserPreferences,
	saveUserPreferences,
} from "@/lib/user/preferences-actions";
import type { UserSettings } from "@/lib/user/preferences";

/**
 * Read dashboard user settings.
 */
export async function getUserSettings() {
	return resolveUserPreferences();
}

/**
 * Save dashboard user settings.
 */
export async function saveUserSettings(settings: Partial<UserSettings>) {
	return saveUserPreferences(settings, { requireAuth: true });
}
