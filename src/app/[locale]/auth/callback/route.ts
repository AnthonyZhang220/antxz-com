import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface RouteContext {
	params: Promise<{ locale: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
	const { locale } = await context.params;
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = requestUrl.searchParams.get("next") || `/${locale}/dashboard`;

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

	return NextResponse.redirect(new URL(next, request.url));
}
