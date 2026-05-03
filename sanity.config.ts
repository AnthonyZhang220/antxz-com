"use client";

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import { visionTool } from "@sanity/vision";
import { codeInput } from "@sanity/code-input";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schema } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { createPublishWithReadingTimeAction } from "./src/sanity/lib/publish-with-reading-time-action";

export default defineConfig({
	basePath: "/studio",
	projectId,
	dataset,
	// Add and edit the content schema in the './sanity/schemaTypes' folder
	schema: {
		types: schema.types,
	},
	document: {
		actions: (prev, context) => {
			if (context.schemaType !== "post") return prev;

			return prev.map((originalAction) =>
				originalAction.action === "publish"
					? createPublishWithReadingTimeAction(originalAction)
					: originalAction,
			);
		},
	},
	plugins: [
		structureTool({ structure }),
		// Vision is for querying with GROQ from inside the Studio
		// https://www.sanity.io/docs/the-vision-plugin
		visionTool({ defaultApiVersion: apiVersion }),
		codeInput(),
	],
});
