import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface RouteContext {
	params: Promise<{ locale: string }>;
}

function normalizeNextPath(next: string | null, locale: string) {
	if (!next) {
		return `/${locale}/dashboard`;
	}

	if (!next.startsWith("/") || next.startsWith("//")) {
		return `/${locale}/dashboard`;
	}

	return next;
}

export async function GET(request: NextRequest, context: RouteContext) {
	const { locale } = await context.params;
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = normalizeNextPath(requestUrl.searchParams.get("next"), locale);

	if (!code) {
		return NextResponse.redirect(
			new URL(`/${locale}/auth/error?error=Missing code`, request.url)
		);
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.exchangeCodeForSession(code);

	if (error) {
		return NextResponse.redirect(
			new URL(
				`/${locale}/auth/error?error=${encodeURIComponent(error.message)}`,
				request.url
			)
		);
	}

	const callbackSuccessUrl = new URL(`/${locale}/auth/callback/success`, request.url);
	callbackSuccessUrl.searchParams.set("next", next);

	return NextResponse.redirect(callbackSuccessUrl);
}
