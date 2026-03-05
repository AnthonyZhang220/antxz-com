"use server";

import { cookies } from "next/headers";

/**
 * 保存用户偏好设置
 */
export async function savePreferences(locale: string, region: string) {
  // 简单的验证
  if (!["en", "zh"].includes(locale)) {
    return { success: false, error: "Invalid locale" };
  }

  if (!["global", "us", "cn"].includes(region)) {
    return { success: false, error: "Invalid region" };
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set("preferred_locale", locale);
    cookieStore.set("preferred_region", region);

    return { success: true };
  } catch (error) {
    console.error("Failed to save preferences:", error);
    return { success: false, error: "Failed to save preferences" };
  }
}
