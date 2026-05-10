import { defineField, defineType } from "sanity";

/**
 * Singleton document for the About Me page.
 * Fixed document ID: "singleton-aboutMe"
 * Only one document of this type should ever exist.
 *
 * Text fields use a { en, zh } object pattern for bilingual support.
 */
export const aboutMe = defineType({
	name: "aboutMe",
	title: "About Me",
	type: "document",
	fields: [
		defineField({
			name: "headline",
			title: "Headline",
			description: "One-line intro shown at the top of the page.",
			type: "object",
			fields: [
				{ name: "en", title: "English", type: "string" },
				{ name: "zh", title: "中文", type: "string" },
			],
		}),
		defineField({
			name: "tagline",
			title: "Tagline / Subtitle",
			description: "Short descriptive sentence shown below the headline.",
			type: "object",
			fields: [
				{ name: "en", title: "English", type: "text", rows: 2 },
				{ name: "zh", title: "中文", type: "text", rows: 2 },
			],
		}),
		defineField({
			name: "profileImage",
			title: "Profile Image",
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
			name: "body",
			title: "Main Body",
			description: "The full self-description article.",
			type: "object",
			fields: [
				{
					name: "en",
					title: "English",
					type: "array",
					of: [
						{ type: "block" },
						{
							type: "image",
							options: { hotspot: true },
							fields: [
								{ name: "caption", title: "Caption", type: "string" },
								{ name: "alt", title: "Alt Text", type: "string" },
							],
						},
					],
				},
				{
					name: "zh",
					title: "中文",
					type: "array",
					of: [
						{ type: "block" },
						{
							type: "image",
							options: { hotspot: true },
							fields: [
								{ name: "caption", title: "Caption", type: "string" },
								{ name: "alt", title: "Alt Text", type: "string" },
							],
						},
					],
				},
			],
		}),
		defineField({
			name: "updatedAt",
			title: "Last Updated",
			type: "datetime",
		}),
	],
	preview: {
		prepare() {
			return {
				title: "About Me",
				subtitle: "Singleton — edit directly",
			};
		},
	},
});
