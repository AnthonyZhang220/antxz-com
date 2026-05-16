import { NextRequest, NextResponse } from "next/server";
import { withI18n } from "./middlewares/with-i18n";
import { updateSession } from "@/middlewares/with-supabase";
import { preferenceCookieOptions } from "@/lib/user/preferences";

type Region = "cn" | "us" | "global";
type Locale = "en" | "zh";

function isRegion(v?: string): v is Region {
	return v === "cn" || v === "us" || v === "global";
}

function detectRegion(req: NextRequest): Region {
	const cookie = req.cookies.get("preferred_region")?.value;
	if (isRegion(cookie)) return cookie;

	const country = req.headers.get("cf-ipcountry") || "US";

	if (["CN", "HK", "TW", "MO"].includes(country)) return "cn";
	if (country === "US") return "us";

	return "global";
}

export async function middleware(request: NextRequest) {
	// =========================
	// 1. Supabase session (logged-in source)
	// =========================
	const { supabaseResponse, serverSettings } = await updateSession(request);

	const cookieLocale = request.cookies.get("preferred_locale")?.value;
	const cookieRegion = request.cookies.get("preferred_region")?.value;

	// =========================
	// 2. Region resolution (fallback only)
	// =========================
	const region: Region =
		serverSettings?.region ??
		(isRegion(cookieRegion) ? cookieRegion : detectRegion(request));

	// =========================
	// 3. Locale (ONLY fallback for cookie init)
	// default locale based on region, but can be overridden by cookie or server settings
	let locale: Locale;
	if (serverSettings?.locale) {
		locale = serverSettings.locale;
	} else if (cookieLocale === "zh" || cookieLocale === "en") {
		locale = cookieLocale;
	} else {
		// 用户未登录且无 cookie，按 region 设定
		locale = region === "cn" ? "zh" : "en";
	}

	// =========================
	// 4. Redirect if URL locale doesn't match server settings
	//    Set cookies before redirecting so next request has them
	// =========================
	const urlLocale = request.nextUrl.pathname.split("/")[1];
	const expectedLocale = serverSettings?.locale ?? locale;
	const expectedTheme = serverSettings?.theme ?? "system";

	if (
		(urlLocale === "en" || urlLocale === "zh") &&
		urlLocale !== expectedLocale &&
		(serverSettings?.locale || !cookieLocale)
	) {
		const newPath = request.nextUrl.pathname.replace(
			`/${urlLocale}`,
			`/${expectedLocale}`,
		);

		const redirectResponse = NextResponse.redirect(
			new URL(newPath, request.url),
		);

		redirectResponse.cookies.set(
			"preferred_locale",
			expectedLocale,
			preferenceCookieOptions,
		);
		redirectResponse.cookies.set(
			"preferred_region",
			region,
			preferenceCookieOptions,
		);

		redirectResponse.cookies.set(
			"preferred_theme",
			expectedTheme,
			preferenceCookieOptions,
		);

		supabaseResponse.cookies.getAll().forEach((cookie) => {
			redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
		});

		return redirectResponse;
	}

	// =========================
	// 5. next-intl handles routing
	// =========================
	const intlResponse = withI18n(request);

	// =========================
	// 6. merge supabase cookies
	// =========================
	supabaseResponse.cookies.getAll().forEach((cookie) => {
		intlResponse.cookies.set(cookie.name, cookie.value, cookie);
	});

	// =========================
	// 7. Sync preference cookies
	// =========================
	if (serverSettings?.locale) {
		intlResponse.cookies.set(
			"preferred_locale",
			serverSettings.locale,
			preferenceCookieOptions,
		);
	} else if (!cookieLocale) {
		intlResponse.cookies.set(
			"preferred_locale",
			locale,
			preferenceCookieOptions,
		);
	}

	if (serverSettings?.region) {
		intlResponse.cookies.set(
			"preferred_region",
			serverSettings.region,
			preferenceCookieOptions,
		);
	} else if (!cookieRegion) {
		intlResponse.cookies.set(
			"preferred_region",
			region,
			preferenceCookieOptions,
		);
	}

	return intlResponse;
}

export const config = {
	matcher: ["/((?!api|studio|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
