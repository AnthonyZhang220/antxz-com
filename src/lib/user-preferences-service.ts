import { cookies } from "next/headers";

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
} from "@/lib/user-preferences";
import { readUserSettingsFromCookies } from "@/lib/user-preferences-server";

type PreferencesResult<T = void> =
	| { success: true; data?: T }
	| { success: false; error: string };

function validateUserSettingsPatch(
	settings: Partial<UserSettings>
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

async function syncPreferenceCookies(settings: Partial<UserSettings>) {
	const cookieStore = await cookies();

	if (settings.locale) {
		cookieStore.set("preferred_locale", settings.locale, preferenceCookieOptions);
	}

	if (settings.region) {
		cookieStore.set("preferred_region", settings.region, preferenceCookieOptions);
	}

	if (settings.theme) {
		cookieStore.set("preferred_theme", settings.theme, preferenceCookieOptions);
	}
}

export async function getAuthenticatedUserSettings(): Promise<
	PreferencesResult<UserSettings>
> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, error: "Not authenticated" };
	}

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
		console.error("Failed to fetch user settings:", error);
		return { success: false, error: "Failed to fetch settings" };
	}

	const cookieSettings = await readUserSettingsFromCookies();
	const resolvedSettings: UserSettings = data
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

	await syncPreferenceCookies(resolvedSettings);

	return { success: true, data: resolvedSettings };
}

export async function saveUserPreferences(
	settings: Partial<UserSettings>,
	options: { requireAuth?: boolean } = {}
): Promise<PreferencesResult<UserSettings>> {
	const validation = validateUserSettingsPatch(settings);
	if (!validation.success) {
		return validation;
	}

	await syncPreferenceCookies(settings);

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		if (options.requireAuth) {
			return { success: false, error: "Not authenticated" };
		}

		const cookieSettings = await readUserSettingsFromCookies();
		return {
			success: true,
			data: {
				...cookieSettings,
				notifications_enabled:
					settings.notifications_enabled ??
					defaultUserSettings.notifications_enabled,
			},
		};
	}

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
		console.error("Failed to fetch current user settings:", fetchError);
		return { success: false, error: "Failed to save settings" };
	}

	const cookieSettings = await readUserSettingsFromCookies();
	const resolvedSettings: UserSettings = {
		locale: settings.locale ?? existing?.locale ?? cookieSettings.locale,
		region: settings.region ?? existing?.region ?? cookieSettings.region,
		theme: settings.theme ?? existing?.theme ?? cookieSettings.theme,
		notifications_enabled:
			settings.notifications_enabled ??
			existing?.notifications_enabled ??
			defaultUserSettings.notifications_enabled,
	};

	if (isMissingUserSettingsTableError(fetchError)) {
		return { success: true, data: resolvedSettings };
	}

	const { error: upsertError } = await supabase.from("user_settings").upsert(
		{
			user_id: user.id,
			...resolvedSettings,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: "user_id" }
	);

	if (upsertError) {
		console.error("Failed to save user settings:", upsertError);
		return { success: false, error: "Failed to save settings" };
	}

	await syncPreferenceCookies(resolvedSettings);

	return { success: true, data: resolvedSettings };
}