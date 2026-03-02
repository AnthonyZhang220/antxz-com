import { NextRequest, NextResponse } from "next/server";
import { intlMiddleware } from "@/i18n/middleware";

export function withI18n(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// 1. 排除 API 路由、静态资源和 Sanity Studio (如果有)
	if (
		pathname.startsWith("/api") ||
		pathname.startsWith("/_next") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// 2. 如果是根路径 "/"，根据 Cloudflare Header 进行地理位置重定向
	if (pathname === "/") {
		const country = req.headers.get("cf-ipcountry") || "US";
		const regionLocale = ["CN", "HK", "TW", "MO"].includes(country)
			? "zh"
			: "en";

		// 重定向到对应的语言首页，例如 /zh
		return NextResponse.redirect(new URL(`/${regionLocale}`, req.url));
	}

	// 3. 其他路径交给 next-intl 处理（如 /about -> /en/about）
	return intlMiddleware(req);
}

export const config = {
	// 匹配所有需要 i18n 的路径
	matcher: ["/((?!studio|api|_next|.*\\..*).*)"],
};
