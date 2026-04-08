import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function normalizeNextPath(next: string | null) {
	if (!next || !next.startsWith("/") || next.startsWith("//")) {
		return "/en/dashboard";
	}

	return next;
}

function deriveLocale(nextPath: string) {
	const firstSegment = nextPath.split("/")[1];
	return firstSegment === "zh" || firstSegment === "en" ? firstSegment : "en";
}

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = normalizeNextPath(requestUrl.searchParams.get("next"));

	if (!code) {
		return NextResponse.redirect(new URL(`/auth/error?error=Missing code`, request.url));
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.exchangeCodeForSession(code);

	if (error) {
		return NextResponse.redirect(
			new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, request.url),
		);
	}

	const locale = deriveLocale(next);
	const callbackSuccessUrl = new URL(`/${locale}/auth/callback/success`, request.url);
	callbackSuccessUrl.searchParams.set("next", next);

	return NextResponse.redirect(callbackSuccessUrl);
}
