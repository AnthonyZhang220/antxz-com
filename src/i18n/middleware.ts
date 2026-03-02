import createMiddleware from "next-intl/middleware";
import { locales } from "./request";

export const intlMiddleware = createMiddleware({
	locales,
	defaultLocale: "en",
	localePrefix: "always",
});
