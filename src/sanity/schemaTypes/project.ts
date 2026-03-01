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
			name: "slug",
			title: "Slug",
			type: "slug",
			options: { source: "title" },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			rows: 3,
		}),
		defineField({
			name: "coverImage",
			title: "Cover Image",
			type: "image",
			options: { hotspot: true },
		}),
		defineField({
			name: "images",
			title: "Images",
			type: "array",
			of: [{ type: "image", options: { hotspot: true } }],
		}),
		defineField({
			name: "tags",
			title: "Tags",
			type: "array",
			of: [{ type: "string" }],
			options: { layout: "tags" },
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
			name: "featured",
			title: "Featured",
			type: "boolean",
			description: "Show on homepage",
			initialValue: false,
		}),
		defineField({
			name: "publishedAt",
			title: "Published At",
			type: "datetime",
		}),
		defineField({
			name: "body",
			title: "Details",
			type: "array",
			of: [{ type: "block" }],
		}),
	],
	preview: {
		select: {
			title: "title",
			media: "coverImage",
			featured: "featured",
		},
		prepare({ title, media, featured }) {
			return {
				title,
				media,
				subtitle: featured ? "⭐ Featured" : "",
			};
		},
	},
});
