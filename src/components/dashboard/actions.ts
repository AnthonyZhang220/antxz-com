"use server";

import { createClient } from "@/lib/supabase/server";

export type UserSettings = {
	locale: "en" | "zh";
	region: "cn" | "us" | "global";
	theme: "light" | "dark" | "system";
	notifications_enabled: boolean;
};

/**
 * 从数据库读取用户设置
 */
export async function getUserSettings() {
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

	if (error && error.code !== "PGRST116") {
		// PGRST116 = no rows found
		console.error("Failed to fetch user settings:", error);
		return { success: false, error: "Failed to fetch settings" };
	}

	return {
		success: true,
		data: data || {
			locale: "en",
			region: "global",
			theme: "system",
			notifications_enabled: true,
		},
	};
}

/**
 * 保存用户设置到数据库
 */
export async function saveUserSettings(settings: Partial<UserSettings>) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, error: "Not authenticated" };
	}

	// 验证输入
	if (settings.locale && !["en", "zh"].includes(settings.locale)) {
		return { success: false, error: "Invalid locale" };
	}

	if (settings.region && !["global", "us", "cn"].includes(settings.region)) {
		return { success: false, error: "Invalid region" };
	}

	if (settings.theme && !["light", "dark", "system"].includes(settings.theme)) {
		return { success: false, error: "Invalid theme" };
	}

	try {
		const { error } = await supabase.from("user_settings").upsert(
			{
				user_id: user.id,
				...settings,
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "user_id" }
		);

		if (error) {
			console.error("Failed to save settings:", error);
			return { success: false, error: "Failed to save settings" };
		}

		return { success: true };
	} catch (error) {
		console.error("Error saving settings:", error);
		return { success: false, error: "Failed to save settings" };
	}
}
