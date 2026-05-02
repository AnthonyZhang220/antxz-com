import { defineField, defineType } from "sanity";

export const project = defineType({
	name: "project",
	title: "Project",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "subtitle",
			title: "Subtitle",
			type: "string",
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: { source: "title" },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "introduction",
			title: "Introduction",
			type: "text",
			rows: 3,
		}),
		defineField({
			name: "overview",
			title: "Overview",
			type: "text",
			rows: 5,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "coverImage",
			title: "Cover Image",
			type: "image",
			options: { hotspot: true },
			fields: [
				defineField({
					name: "alt",
					title: "Alt Text",
					type: "string",
				}),
			],
		}),
		defineField({
			name: "screenshots",
			title: "Screenshots",
			type: "array",
			description:
				"Add multiple screenshots to show key flows (recommended: 3+ images for better storytelling).",
			of: [
				{
					type: "image",
					options: { hotspot: true },
					fields: [
						defineField({
							name: "alt",
							title: "Alt Text",
							type: "string",
						}),
					],
				},
			],
			validation: (Rule) =>
				Rule.custom((screenshots, context) => {
					const isFeatured = Boolean((context.document as { featured?: boolean })?.featured);
					if (isFeatured && (!Array.isArray(screenshots) || screenshots.length < 3)) {
						return "Featured projects should include at least 3 screenshots.";
					}

					return true;
				}),
		}),
		defineField({
			name: "roles",
			title: "Roles",
			type: "array",
			of: [{ type: "string" }],
			options: { layout: "tags" },
		}),
		defineField({
			name: "features",
			title: "Features",
			type: "array",
			of: [
				{
					type: "object",
					name: "featureItem",
					title: "Feature",
					fields: [
						defineField({
							name: "name",
							title: "Name",
							type: "string",
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: "detail",
							title: "Detail",
							type: "text",
							rows: 3,
							validation: (Rule) => Rule.required(),
						}),
					],
				},
			],
		}),
		defineField({
			name: "libraries",
			title: "Libraries",
			type: "array",
			of: [{ type: "string" }],
			options: { layout: "tags" },
		}),
		defineField({
			name: "tags",
			title: "Tags",
			type: "array",
			of: [{ type: "string" }],
			options: { layout: "tags" },
		}),
		defineField({
			name: "process",
			title: "Process",
			type: "text",
			rows: 4,
		}),
		defineField({
			name: "challenges",
			title: "Challenges",
			type: "text",
			rows: 4,
		}),
		defineField({
			name: "results",
			title: "Results",
			type: "text",
			rows: 4,
		}),
		defineField({
			name: "url",
			title: "Live URL",
			type: "url",
		}),
		defineField({
			name: "github",
			title: "GitHub URL",
			type: "url",
		}),
		defineField({
			name: "isNew",
			title: "Is New",
			type: "boolean",
			initialValue: false,
		}),
		defineField({
			name: "featured",
			title: "Featured",
			type: "boolean",
			description: "Show on homepage",
			initialValue: false,
		}),
		defineField({
			name: "sortOrder",
			title: "Sort Order",
			type: "number",
			description: "Lower number appears first. Leave empty to sort by publish date.",
		}),
		defineField({
			name: "publishedAt",
			title: "Published At",
			type: "datetime",
			initialValue: () => new Date().toISOString(),
		}),
		defineField({
			name: "body",
			title: "Rich Details",
			type: "array",
			of: [{ type: "block" }],
		}),
	],
	preview: {
		select: {
			title: "title",
			media: "coverImage",
			featured: "featured",
			isNew: "isNew",
		},
		prepare({ title, media, featured, isNew }) {
			const marks = [featured ? "⭐ Featured" : null, isNew ? "🆕 New" : null]
				.filter(Boolean)
				.join(" · ");
			return {
				title,
				media,
				subtitle: marks,
			};
		},
	},
});
