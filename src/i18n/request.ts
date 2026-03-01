import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

// 支持的语言列表
export const locales = ["en", "zh"];

export default getRequestConfig(async ({ requestLocale }) => {
	const locale = await requestLocale;

	// 如果路径中的 locale 不在支持列表中，直接 404
	if (!locale || !locales.includes(locale)) notFound();

	return {
		locale,
		messages: (await import(`@/messages/${locale}.json`)).default,
		// ── 日期格式定义 ──────────────────────────────────────────────
		// 在组件里用 fmt.dateTime(date, "short") 调用
		formats: {
			dateTime: {
				// Feb 10, 2026  /  2026年2月10日
				short: {
					month: "short",
					day: "numeric",
					year: "numeric",
				},
				// February 10, 2026  /  2026年2月10日（长格式）
				long: {
					month: "long",
					day: "numeric",
					year: "numeric",
				},
				// 02/10/2026  /  2026/02/10
				numeric: {
					month: "2-digit",
					day: "2-digit",
					year: "numeric",
				},
			},
		},
	};
});
