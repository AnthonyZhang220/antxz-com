import { defineField, defineType } from "sanity";

export const post = defineType({
	name: "post",
	title: "Blog Post",
	type: "document",
	fields: [
		defineField({
			name: "titleI18n",
			title: "Title (i18n)",
			type: "object",
			description: "Optional bilingual title. Falls back to legacy Title when empty.",
			fields: [
				defineField({ name: "en", title: "English", type: "string" }),
				defineField({ name: "zh", title: "Chinese", type: "string" }),
			],
		}),
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
			options: { source: "title", maxLength: 96 },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "publishedAt",
			title: "Published At",
			type: "datetime",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "excerptI18n",
			title: "Excerpt (i18n)",
			type: "object",
			description: "Optional bilingual excerpt. Falls back to legacy Excerpt when empty.",
			fields: [
				defineField({ name: "en", title: "English", type: "text", rows: 3 }),
				defineField({ name: "zh", title: "Chinese", type: "text", rows: 3 }),
			],
		}),
		defineField({
			name: "excerpt",
			title: "Excerpt",
			type: "text",
			rows: 3,
			description: "Short description shown in blog list",
		}),
		defineField({
			name: "readingTime",
			title: "Reading Time (minutes)",
			type: "number",
			description: "Estimated read time in minutes",
			validation: (Rule) => Rule.integer().min(1),
		}),
		defineField({
			name: "coverImage",
			title: "Cover Image",
			type: "image",
			options: { hotspot: true },
		}),
		defineField({
			name: "category",
			title: "Content Category",
			type: "reference",
			to: [{ type: "category" }],
			description:
				"Top-level classification for this post, such as Tech, Life, Career, or Notes.",
		}),
		defineField({
			name: "tags",
			title: "Tags",
			type: "array",
			of: [{ type: "string" }],
			options: { layout: "tags" },
			description:
				"Specific topics covered in the post, such as React, Frontend, Performance, Travel, or Shanghai.",
		}),
		defineField({
			name: "bodyI18n",
			title: "Body (i18n)",
			type: "object",
			description: "Optional bilingual body. Falls back to legacy Body when empty.",
			fields: [
				defineField({
					name: "en",
					title: "English",
					type: "array",
					of: [
						{ type: "block" },
						{
							type: "image",
							options: { hotspot: true },
							fields: [
								{
									name: "caption",
									type: "string",
									title: "Caption",
								},
							],
						},
						{ type: "code" },
					],
				}),
				defineField({
					name: "zh",
					title: "Chinese",
					type: "array",
					of: [
						{ type: "block" },
						{
							type: "image",
							options: { hotspot: true },
							fields: [
								{
									name: "caption",
									type: "string",
									title: "Caption",
								},
							],
						},
						{ type: "code" },
					],
				}),
			],
		}),
		defineField({
			name: "body",
			title: "Body",
			type: "array",
			of: [
				{ type: "block" },
				{
					type: "image",
					options: { hotspot: true },
					fields: [
						{
							name: "caption",
							type: "string",
							title: "Caption",
						},
					],
				},
				{ type: "code" }, // requires @sanity/code-input
			],
		}),
		defineField({
			name: "originalLanguage",
			title: "Original Language",
			type: "string",
			description: "Which language is the original content written in?",
			options: {
				list: [
					{ title: "English", value: "en" },
					{ title: "Chinese", value: "zh" },
				],
			},
			initialValue: "en",
		}),
		defineField({
			name: "source",
			title: "Source",
			type: "object",
			description: "If this post was originally published elsewhere",
			fields: [
				{
					name: "platform",
					title: "Platform",
					type: "string",
					options: {
						list: ["medium", "devto", "original"],
					},
				},
				{
					name: "originalUrl",
					title: "Original URL",
					type: "url",
				},
			],
		}),
	],
	preview: {
		select: {
			title: "title",
			media: "coverImage",
			date: "publishedAt",
			categoryTitle: "category.title",
		},
		prepare({ title, media, date, categoryTitle }) {
			const subtitleParts = [
				categoryTitle ? `Category: ${categoryTitle}` : null,
				date ? new Date(date).toLocaleDateString() : "No date",
			].filter(Boolean);

			return {
				title,
				media,
				subtitle: subtitleParts.join(" · "),
			};
		},
	},
});
