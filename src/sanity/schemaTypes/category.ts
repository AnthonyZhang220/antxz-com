import { defineField, defineType } from "sanity";

export const category = defineType({
	name: "category",
	title: "Content Categories",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Category Name",
			type: "object",
			description: "Localized category title. Example: zh=技术, en=Tech.",
			fields: [
				defineField({
					name: "en",
					title: "English",
					type: "string",
				}),
				defineField({
					name: "zh",
					title: "Chinese",
					type: "string",
				}),
			],
			validation: (Rule) =>
				Rule.custom((value) => {
					const typedValue = value as { en?: string; zh?: string } | undefined;
					if (typedValue?.en || typedValue?.zh) return true;
					return "Provide at least one localized title (en or zh).";
				}),
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: {
				source: (doc) => {
					const typedDoc = doc as { title?: { en?: string; zh?: string } };
					return typedDoc?.title?.en || typedDoc?.title?.zh || "";
				},
			},
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			rows: 2,
			description: "Optional note describing what kinds of posts belong in this category.",
		}),
	],
	preview: {
		select: {
			titleEn: "title.en",
			titleZh: "title.zh",
			description: "description",
		},
		prepare({ titleEn, titleZh, description }) {
			const title = titleZh || titleEn || "Untitled category";
			const localeHint = [titleZh ? "zh" : null, titleEn ? "en" : null]
				.filter(Boolean)
				.join("/");
			const subtitleParts = [
				description || null,
				localeHint ? `Locales: ${localeHint}` : null,
			].filter(Boolean);

			return {
				title,
				subtitle: subtitleParts.join(" · ") || "Top-level blog classification",
			};
		},
	},
});
