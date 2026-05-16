"use server";

import { createClient } from "@/lib/supabase/server";
import {
	defaultUserSettings,
	isAppLocale,
	isAppRegion,
	isAppTheme,
	isMissingUserSettingsRowError,
	isMissingUserSettingsTableError,
	preferenceCookieOptions,
	type UserSettings,
} from "@/lib/user/preferences";

import { readUserSettingsFromCookies } from "@/lib/user/preferences-server";
import { cookies } from "next/headers";

/* -----------------------------
   Types
------------------------------ */

type PreferencesResult<T = void> =
	| { success: true; data?: T }
	| { success: false; error: string };

/* -----------------------------
   Validation
------------------------------ */

function validateUserSettingsPatch(
	settings: Partial<UserSettings>,
): PreferencesResult {
	if (settings.locale && !isAppLocale(settings.locale)) {
		return { success: false, error: "Invalid locale" };
	}

	if (settings.region && !isAppRegion(settings.region)) {
		return { success: false, error: "Invalid region" };
	}

	if (settings.theme && !isAppTheme(settings.theme)) {
		return { success: false, error: "Invalid theme" };
	}

	return { success: true };
}

/* =========================================================
   CORE: single source of truth resolver
========================================================= */

export async function resolveUserPreferences(): Promise<
	PreferencesResult<UserSettings>
> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// -----------------------------
	// 1. LOGGED IN → DB wins
	// -----------------------------
	if (user) {
		const { data, error } = await supabase
			.from("user_settings")
			.select("*")
			.eq("user_id", user.id)
			.single();

		if (
			error &&
			!isMissingUserSettingsRowError(error) &&
			!isMissingUserSettingsTableError(error)
		) {
			return { success: false, error: "Failed to fetch settings" };
		}

		const cookieSettings = await readUserSettingsFromCookies();

		const resolved: UserSettings = data
			? {
					locale: data.locale,
					region: data.region,
					theme: data.theme,
					notifications_enabled: data.notifications_enabled,
				}
			: {
					...cookieSettings,
					notifications_enabled: defaultUserSettings.notifications_enabled,
				};

		return { success: true, data: resolved };
	}

	// -----------------------------
	// 2. GUEST → cookie fallback
	// -----------------------------
	const cookieSettings = await readUserSettingsFromCookies();

	return {
		success: true,
		data: {
			...cookieSettings,
			notifications_enabled: defaultUserSettings.notifications_enabled,
		},
	};
}

/* =========================================================
   SAVE: DB + cookies sync (ONLY HERE)
========================================================= */

export async function saveUserPreferences(
	settings: Partial<UserSettings>,
	options: { requireAuth?: boolean } = {},
): Promise<PreferencesResult<UserSettings>> {
	const validation = validateUserSettingsPatch(settings);
	if (!validation.success) return validation;

	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// -----------------------------
	// Guest mode
	// -----------------------------
	if (!user) {
		if (options.requireAuth) {
			return { success: false, error: "Not authenticated" };
		}

		const cookieSettings = await readUserSettingsFromCookies();

		const merged: UserSettings = {
			...cookieSettings,
			...settings,
		};

		await syncPreferenceCookies(merged);

		return { success: true, data: merged };
	}

	// -----------------------------
	// Logged-in mode
	// -----------------------------
	const { data: existing, error: fetchError } = await supabase
		.from("user_settings")
		.select("*")
		.eq("user_id", user.id)
		.single();

	if (
		fetchError &&
		!isMissingUserSettingsRowError(fetchError) &&
		!isMissingUserSettingsTableError(fetchError)
	) {
		return { success: false, error: "Failed to save settings" };
	}

	const cookieSettings = await readUserSettingsFromCookies();

	const resolved: UserSettings = {
		locale: settings.locale ?? existing?.locale ?? cookieSettings.locale,
		region: settings.region ?? existing?.region ?? cookieSettings.region,
		theme: settings.theme ?? existing?.theme ?? cookieSettings.theme,
		notifications_enabled:
			settings.notifications_enabled ??
			existing?.notifications_enabled ??
			defaultUserSettings.notifications_enabled,
	};

	await supabase.from("user_settings").upsert(
		{
			user_id: user.id,
			...resolved,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: "user_id" },
	);

	// ONLY write cookies here
	await syncPreferenceCookies(resolved);

	return { success: true, data: resolved };
}

/* =========================================================
   COOKIE SYNC (ONLY SIDE EFFECT LAYER)
========================================================= */

async function syncPreferenceCookies(settings: Partial<UserSettings>) {
	const cookieStore = await cookies();

	if (settings.locale) {
		cookieStore.set(
			"preferred_locale",
			settings.locale,
			preferenceCookieOptions,
		);
	}

	if (settings.region) {
		cookieStore.set(
			"preferred_region",
			settings.region,
			preferenceCookieOptions,
		);
	}

	if (settings.theme) {
		cookieStore.set("preferred_theme", settings.theme, preferenceCookieOptions);
	}
}
