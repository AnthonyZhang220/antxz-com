import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import {
	defaultUserSettings,
	isAppLocale,
	isAppRegion,
	isAppTheme,
	isMissingUserSettingsRowError,
	isMissingUserSettingsTableError,
	type UserSettings,
} from "@/lib/user-preferences";

export async function readUserSettingsFromCookies(): Promise<UserSettings> {
	const cookieStore = await cookies();
	const locale = cookieStore.get("preferred_locale")?.value;
	const region = cookieStore.get("preferred_region")?.value;
	const theme = cookieStore.get("preferred_theme")?.value;

	return {
		locale: isAppLocale(locale) ? locale : defaultUserSettings.locale,
		region: isAppRegion(region) ? region : defaultUserSettings.region,
		theme: isAppTheme(theme) ? theme : defaultUserSettings.theme,
		notifications_enabled: defaultUserSettings.notifications_enabled,
	};
}

export async function ensureUserSettingsFromCookies(userId: string) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("user_settings")
		.select("user_id")
		.eq("user_id", userId)
		.single();

	if (data?.user_id) {
		return;
	}

	if (isMissingUserSettingsTableError(error)) {
		return;
	}

	if (error && !isMissingUserSettingsRowError(error)) {
		console.error("Failed to inspect user settings during bootstrap:", error);
		return;
	}

	const cookieSettings = await readUserSettingsFromCookies();
	const { error: insertError } = await supabase.from("user_settings").insert({
		user_id: userId,
		...cookieSettings,
	});

	if (insertError) {
		console.error("Failed to bootstrap user settings from cookies:", insertError);
	}
}