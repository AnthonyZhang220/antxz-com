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

function forwardRequestHeader(
	response: NextResponse,
	name: string,
	value: string,
) {
	response.headers.set(`x-middleware-request-${name}`, value);
	const existing = response.headers.get("x-middleware-override-headers");
	const names = existing ? existing.split(",") : [];
	if (!names.includes(name)) names.push(name);
	response.headers.set("x-middleware-override-headers", names.join(","));
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

	// 判断是否为爬虫（简单的 User-Agent 检测，适用于常见搜索引擎爬虫）
	const userAgent = request.headers.get("user-agent") ?? "";
	const isBot =
		/googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|sogou|facebookexternalhit|twitterbot/i.test(
			userAgent,
		);
	// URL 上的 locale 是 "en" 或 "zh"，且与预期不符时才重定向
	const urlLocale = request.nextUrl.pathname.split("/")[1];
	// 预期的 locale 来自服务器设置（如果有）或根据 region 检测的结果，优先级高于 cookie，因为服务器设置更权威，且用户可能在不同设备上访问
	const expectedLocale = serverSettings?.locale ?? locale;
	// 预期的 theme 来自服务器设置（如果有），优先级高于 cookie，因为服务器设置更权威，且用户可能在不同设备上访问
	const expectedTheme = serverSettings?.theme ?? "system";

	// 只有当 URL 上的 locale 是 "en" 或 "zh"，且与预期不符时才重定向
	// 这样可以避免对其他路径（如 API 路径、静态资源等）进行不必要的重定向
	// 同时，如果用户是爬虫，则不进行重定向，以免影响 SEO
	// 另外，如果服务器设置了 locale，或者用户没有 cookie，则优先使用服务器设置或默认检测的 locale 来决定是否重定向
	// 这样可以确保用户在登录后（服务器设置了 locale）或首次访问（没有 cookie）时能够正确重定向到适合他们的语言版本
	// 注意：如果用户手动输入了 URL（如访问了 /en/about），我们尊重他们的选择，不强制重定向，除非服务器设置了 locale 或用户没有 cookie，这样可以兼顾用户自主选择和智能重定向
	// 综上所述，这个重定向逻辑旨在在尊重用户选择的同时，提供智能的默认行为，并确保爬虫能够正确索引内容，同时避免对非页面路径进行干扰
	if (
		!isBot &&
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

	forwardRequestHeader(intlResponse, "x-region", region);

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
