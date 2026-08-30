import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale;

	return {
		locale,
		messages: (await import(`@/messages/${locale}.json`)).default,
		formats: {
			dateTime: {
				short: {
					month: "short",
					day: "numeric",
					year: "numeric",
				},
				long: {
					month: "long",
					day: "numeric",
					year: "numeric",
				},
				numeric: {
					month: "2-digit",
					day: "2-digit",
					year: "numeric",
				},
			},
		},
	};
});
