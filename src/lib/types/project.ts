export interface ProjectFeature {
	name: string;
	detail: string;
}

export interface ProjectItem {
	_id?: string;
	id?: number;
	slug: string;
	title: string;
	subtitle?: string;
	introduction?: string;
	overview: string;
	features?: ProjectFeature[];
	featured?: boolean;
	roles?: string[];
	libraries?: string[];
	process?: string;
	challenges?: string;
	results?: string;
	screenshots?: Array<{
		asset?: { _ref: string; _type: "reference" };
		url?: string;
		alt?: string;
	}>;
	coverImage?: {
		asset?: { _ref: string; _type: "reference" };
		url?: string;
		alt?: string;
	};
	body?: unknown[];
	tags?: string[];
	websiteUrl?: string;
	githubUrl?: string;
	isNew?: boolean;
	publishedAt?: string;
}
