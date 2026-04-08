export const supportedLocales = ["en", "zh"] as const;
export const supportedRegions = ["cn", "us", "global"] as const;
export const supportedThemes = ["light", "dark", "system"] as const;

export type AppLocale = (typeof supportedLocales)[number];
export type AppRegion = (typeof supportedRegions)[number];
export type AppTheme = (typeof supportedThemes)[number];

export type UserSettings = {
	locale: AppLocale;
	region: AppRegion;
	theme: AppTheme;
	notifications_enabled: boolean;
};

type PostgrestErrorLike = {
	code?: string | null;
} | null | undefined;

export const preferenceCookieOptions = {
	path: "/",
	maxAge: 60 * 60 * 24 * 365,
	sameSite: "lax" as const,
};

export function isAppLocale(value: string | undefined): value is AppLocale {
	return Boolean(value && supportedLocales.includes(value as AppLocale));
}

export function isAppRegion(value: string | undefined): value is AppRegion {
	return Boolean(value && supportedRegions.includes(value as AppRegion));
}

export function isAppTheme(value: string | undefined): value is AppTheme {
	return Boolean(value && supportedThemes.includes(value as AppTheme));
}

export function isMissingUserSettingsRowError(error: PostgrestErrorLike) {
	return error?.code === "PGRST116";
}

export function isMissingUserSettingsTableError(error: PostgrestErrorLike) {
	return error?.code === "PGRST205";
}

export const defaultUserSettings: UserSettings = {
	locale: "en",
	region: "global",
	theme: "system",
	notifications_enabled: true,
};