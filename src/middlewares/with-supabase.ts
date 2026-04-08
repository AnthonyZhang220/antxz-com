import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
	isMissingUserSettingsRowError,
	isMissingUserSettingsTableError,
	preferenceCookieOptions,
	type AppLocale,
	type AppRegion,
	type UserSettings,
} from "@/lib/user-preferences";

type SessionSyncResult = {
	supabaseResponse: NextResponse;
	serverSettings?: Pick<UserSettings, "locale" | "region">;
};

export async function updateSession(request: NextRequest): Promise<SessionSyncResult> {
	let supabaseResponse = NextResponse.next({
		request,
	});

	// With Fluid compute, don't put this client in a global environment
	// variable. Always create a new one on each request.
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value),
					);
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	// Do not run code between createServerClient and
	// supabase.auth.getClaims(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: If you remove getClaims() and you use server-side rendering
	// with the Supabase client, your users may be randomly logged out.
	const { data } = await supabase.auth.getClaims();
	const user = data?.claims;
	const userId = typeof user?.sub === "string" ? user.sub : null;
	let serverSettings: SessionSyncResult["serverSettings"];

	if (userId) {
		const { data: settings, error } = await supabase
			.from("user_settings")
			.select("locale, region")
			.eq("user_id", userId)
			.single();

		if (error && !isMissingUserSettingsRowError(error) && !isMissingUserSettingsTableError(error)) {
			console.error("Failed to fetch server user settings in middleware:", error);
		}

		if (settings?.locale && settings?.region) {
			serverSettings = {
				locale: settings.locale as AppLocale,
				region: settings.region as AppRegion,
			};

			supabaseResponse.cookies.set("preferred_locale", settings.locale, preferenceCookieOptions);
			supabaseResponse.cookies.set("preferred_region", settings.region, preferenceCookieOptions);
		}
	}

	// If there's no authenticated user we no longer redirect automatically.
	// This allows public pages (like the homepage) to be accessed without
	// forcing a login.  You can still perform manual checks in individual
	// routes/components if needed.
	//
	// if (
	//   !user &&
	//   !request.nextUrl.pathname.startsWith('/login') &&
	//   !request.nextUrl.pathname.startsWith('/auth')
	// ) {
	//   const url = request.nextUrl.clone()
	//   url.pathname = '/auth/login'
	//   return NextResponse.redirect(url)
	// }

	// IMPORTANT: You *must* return the supabaseResponse object as it is.
	// If you're creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	return { supabaseResponse, serverSettings };
}
