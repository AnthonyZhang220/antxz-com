// src/lib/image.ts
import imageUrlBuilder from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import type { SanityImage } from "@/types/blog";

const builder = imageUrlBuilder(client);

export function getImageUrl(image: SanityImage, width = 800): string {
	// 开发时用 url 字段，生产时走 Sanity CDN
	if (image.url) return image.url;
	return builder.image(image).width(width).url();
}
