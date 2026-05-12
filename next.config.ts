import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	images: {
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
	serverExternalPackages: [
		// Sanity 全家桶
		"sanity",
		"@sanity/client",
		"@sanity/vision",
		"@sanity/ui",
		"@sanity/code-input",
		"next-sanity",
		"styled-components",
		// 纯客户端库
		"recharts",
		"motion",
	],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
