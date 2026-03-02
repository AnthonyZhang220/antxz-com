//region config.ts
export type Region = "cn" | "global";

export interface RegionConfig {
	auth: {
		providers: ("email" | "phone" | "google" | "github")[];
		phoneEnabled: boolean;
	};
	payment: {
		providers: ("stripe" | "alipay" | "wechat")[];
	};
	analytics: {
		provider: "google" | "baidu";
	};
}

const configs: Record<Region, RegionConfig> = {
	cn: {
		auth: {
			providers: ["email", "phone"],
			phoneEnabled: true,
		},
		payment: {
			providers: ["alipay", "wechat"],
		},
		analytics: {
			provider: "baidu",
		},
	},
	global: {
		auth: {
			providers: ["email", "google", "github"],
			phoneEnabled: false,
		},
		payment: {
			providers: ["stripe"],
		},
		analytics: {
			provider: "google",
		},
	},
};

export function getRegionConfig(region: Region): RegionConfig {
	return configs[region];
}
