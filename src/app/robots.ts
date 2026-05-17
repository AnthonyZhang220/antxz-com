import type { MetadataRoute } from "next";

const BASE_URL = "https://antxz.com";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/", "/protected/", "/dashboard/", "/auth/"],
			},
		],
		sitemap: `${BASE_URL}/sitemap.xml`,
	};
}
