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
	};
});
