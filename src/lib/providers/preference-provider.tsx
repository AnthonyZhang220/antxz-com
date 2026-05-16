"use client";

import { createContext, useState } from "react";
import { UserSettings } from "../user/preferences";

export type Locale = "en" | "zh";
export type Region = "cn" | "us" | "global";
export type Theme = "light" | "dark" | "system";

export type Preferences = {
	locale: Locale;
	region: Region;
	theme: Theme;
	notifications_enabled: boolean;
};

export const PreferencesContext = createContext<{
	preferences: UserSettings;
	setPreferences: React.Dispatch<React.SetStateAction<UserSettings>>;
} | null>(null);

export function PreferencesProvider({
	initials,
	children,
}: {
	initials: UserSettings;
	children: React.ReactNode;
}) {
	const [preferences, setPreferences] = useState<UserSettings>(initials);

	return (
		<PreferencesContext.Provider value={{ preferences, setPreferences }}>
			{children}
		</PreferencesContext.Provider>
	);
}
