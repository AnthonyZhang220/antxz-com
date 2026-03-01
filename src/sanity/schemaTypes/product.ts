import { defineField, defineType } from "sanity";

export const product = defineType({
	name: "product",
	title: "Product",
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
			name: "price",
			title: "Price (USD)",
			type: "number",
			validation: (Rule) => Rule.min(0),
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
			name: "inStock",
			title: "In Stock",
			type: "boolean",
			initialValue: true,
		}),
		defineField({
			name: "featured",
			title: "Featured",
			type: "boolean",
			description: "Show on homepage",
			initialValue: false,
		}),
		defineField({
			name: "category",
			title: "Category",
			type: "string",
			options: {
				list: ["digital", "physical", "service"],
			},
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
			price: "price",
			inStock: "inStock",
		},
		prepare({ title, media, price, inStock }) {
			return {
				title,
				media,
				subtitle: `$${price} · ${inStock ? "✅ In Stock" : "❌ Out of Stock"}`,
			};
		},
	},
});
