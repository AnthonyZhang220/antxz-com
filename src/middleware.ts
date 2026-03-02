import { NextRequest, NextResponse } from "next/server";

import { withI18n } from "./middlewares/with-i18n";
import { updateSession } from "@/middlewares/with-supabase";

//detect region based on Cloudflare header or environment variable
function detectRegion(request: NextRequest): "cn" | "global" {
	if (process.env.NEXT_PUBLIC_REGION) {
		const region = process.env.NEXT_PUBLIC_REGION.toLowerCase();

		if (region === "cn" || region === "global") {
			return region;
		}
	}

	const country = request.headers.get("cf-ipcountry") || "US";
	return ["CN", "HK", "TW", "MO"].includes(country) ? "cn" : "global";
}

// This middleware runs on every request and is responsible for:
// 1. Detecting the user's region and adding it to the request headers
// 2. Running the Supabase session logic to ensure auth cookies are set
// 3. Running the next-intl middleware to handle locale redirects
export async function middleware(request: NextRequest) {
	const region = detectRegion(request);

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-region", region);

	const modifiedRequest = new NextRequest(request.url, {
		method: request.method,
		headers: requestHeaders,
		body: request.body,
	});

	if (request.nextUrl.pathname === "/") {
		const locale = region === "cn" ? "zh" : "en";
		return NextResponse.redirect(new URL(`/${locale}`, request.url));
	}

	// run supabase session logic first to ensure cookies are set
	const supabaseResponse = await updateSession(modifiedRequest);
	if (supabaseResponse.headers.get("location")) {
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

	return intlResponse;
}

export const config = {
	matcher: [
		// union of both middleware matchers (supabase & next-intl)
		"/((?!api|studio|_next/static|_next/image|favicon.ico|.*\\..*).*)",
	],
};
