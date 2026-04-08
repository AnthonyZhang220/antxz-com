import { NextRequest, NextResponse } from "next/server";

import { withI18n } from "./middlewares/with-i18n";
import { updateSession } from "@/middlewares/with-supabase";
import { preferenceCookieOptions } from "@/lib/user-preferences";


type Region = "cn" | "us" | "global";
type Locale = "en" | "zh";

function isRegion(value: string | undefined): value is Region {
	return value === "cn" || value === "us" || value === "global";
}

function isLocale(value: string | undefined): value is Locale {
	return value === "en" || value === "zh";
}

function getLocaleFromPathname(pathname: string): Locale | null {
	const segment = pathname.split("/")[1];
	return isLocale(segment) ? segment : null;
}

// detect region based on user preference first, then environment/header fallback
function detectRegion(request: NextRequest): Region {
	const preferredRegion = request.cookies.get("preferred_region")?.value;
	if (isRegion(preferredRegion)) {
		return preferredRegion;
	}

	if (process.env.NEXT_PUBLIC_REGION) {
		const region = process.env.NEXT_PUBLIC_REGION.toLowerCase();

		if (isRegion(region)) {
			return region;
		}
	}

	const country = request.headers.get("cf-ipcountry") || "US";
	if (["CN", "HK", "TW", "MO"].includes(country)) {
		return "cn";
	}

	if (country === "US") {
		return "us";
	}

	return "global";
}

// This middleware runs on every request and is responsible for:
// 1. Detecting the user's region and adding it to the request headers
// 2. Running the Supabase session logic to ensure auth cookies are set
// 3. Running the next-intl middleware to handle locale redirects
export async function middleware(request: NextRequest) {
	const detectedRegion = detectRegion(request);
	const preferredLocale = request.cookies.get("preferred_locale")?.value;

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-region", detectedRegion);

	const modifiedRequest = new NextRequest(request.url, {
		method: request.method,
		headers: requestHeaders,
		body: request.body,
	});

	// run supabase session logic first to ensure cookies are set
	const { supabaseResponse, serverSettings } = await updateSession(modifiedRequest);
	const region = serverSettings?.region ?? detectedRegion;
	const locale = serverSettings?.locale
		? serverSettings.locale
		: isLocale(preferredLocale)
			? preferredLocale
			: region === "cn"
				? "zh"
				: "en";
	const pathnameLocale = getLocaleFromPathname(request.nextUrl.pathname);

	if (serverSettings?.locale && pathnameLocale && pathnameLocale !== serverSettings.locale) {
		const correctedPath = request.nextUrl.pathname.replace(
			`/${pathnameLocale}`,
			`/${serverSettings.locale}`
		);
		const redirectUrl = new URL(correctedPath, request.url);
		redirectUrl.search = request.nextUrl.search;

		const redirectResponse = NextResponse.redirect(redirectUrl);
		supabaseResponse.cookies.getAll().forEach((cookie) => {
			redirectResponse.cookies.set(cookie.name, cookie.value, {
				...cookie,
			});
		});
		redirectResponse.cookies.set("preferred_locale", locale, preferenceCookieOptions);
		redirectResponse.cookies.set("preferred_region", region, preferenceCookieOptions);
		return redirectResponse;
	}

	if (request.nextUrl.pathname === "/") {
		const redirectResponse = NextResponse.redirect(new URL(`/${locale}`, request.url));
		redirectResponse.cookies.set("preferred_locale", locale, preferenceCookieOptions);
		redirectResponse.cookies.set("preferred_region", region, preferenceCookieOptions);
		return redirectResponse;
	}

	if (supabaseResponse.headers.get("location")) {
		supabaseResponse.cookies.set("preferred_locale", locale, preferenceCookieOptions);
		supabaseResponse.cookies.set("preferred_region", region, preferenceCookieOptions);
		return supabaseResponse;
	}

	// pass through to next-intl for locale handling
	const intlResponse = withI18n(request);

	// copy any cookies that supabaseResponse set onto the intlResponse
	supabaseResponse.cookies.getAll().forEach((cookie) => {
		intlResponse.cookies.set(cookie.name, cookie.value, {
			...cookie,
		});
	});

	intlResponse.cookies.set("preferred_locale", locale, preferenceCookieOptions);
	intlResponse.cookies.set("preferred_region", region, preferenceCookieOptions);

	return intlResponse;
}

export const config = {
	matcher: [
		// union of both middleware matchers (supabase & next-intl)
		"/((?!api|studio|_next/static|_next/image|favicon.ico|.*\\..*).*)",
	],
};
