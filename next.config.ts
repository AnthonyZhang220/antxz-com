import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
	/* config options here */
	trailingSlash: true,
	reactCompiler: true,
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "picsum.photos",
			},
			{
				protocol: "https",
				hostname: "cdn.sanity.io",
			},
		],
	},
	env: {
		NEXT_PUBLIC_SANITY_DATASET: "production",
		NEXT_PUBLIC_SANITY_PROJECT_ID: "r4gq7ce2",
	},
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
