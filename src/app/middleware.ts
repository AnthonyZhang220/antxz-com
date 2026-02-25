import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['zh', 'en'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 检查路径是否已经包含语言前缀 (例如 /zh/about)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // 2. 获取 Cloudflare 提供的国家代码 (ISO 3166-1 alpha-2)
  // 注意：本地开发时这个 header 为空
  const country = request.headers.get('cf-ipcountry') || 'US';

  // 3. 根据国家决定目标语言
  let targetLocale = defaultLocale;
  if (['CN', 'HK', 'TW', 'MO'].includes(country)) {
    targetLocale = 'zh';
  }

  // 4. 重定向到带语言标签的路径 (例如 / -> /zh)
  request.nextUrl.pathname = `/${targetLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // 排除静态文件、图片、api 接口
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
};