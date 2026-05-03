import { createClient } from "next-sanity";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-02-27";
const token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_API_TOKEN;
const dryRun = process.argv.includes("--dry-run");

if (!projectId || !dataset) {
	throw new Error(
		"Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET environment variables.",
	);
}

if (!dryRun && !token) {
	throw new Error(
		"Missing SANITY_API_WRITE_TOKEN (or SANITY_API_TOKEN). A write token is required for migration.",
	);
}

const client = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false,
	...(token ? { token } : {}),
});

const CATEGORIES_QUERY = `*[_type == "category"]{_id, title}`;

function hasCjk(text) {
	return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(text);
}

function toLocalizedTitle(value) {
	const text = String(value ?? "").trim();
	if (!text) return null;

	if (hasCjk(text)) {
		return { zh: text };
	}

	return { en: text };
}

async function run() {
	const categories = await client.fetch(CATEGORIES_QUERY);

	const patches = [];
	let skipped = 0;

	for (const category of categories) {
		if (!category || typeof category !== "object") {
			skipped += 1;
			continue;
		}

		const title = category.title;

		if (typeof title === "string") {
			const localized = toLocalizedTitle(title);
			if (!localized) {
				skipped += 1;
				continue;
			}

			patches.push({
				id: category._id,
				before: title,
				after: localized,
			});
			continue;
		}

		if (title && typeof title === "object") {
			const en = String(title.en ?? "").trim();
			const zh = String(title.zh ?? "").trim();
			if (en || zh) {
				skipped += 1;
				continue;
			}
		}

		skipped += 1;
	}

	console.log(`Categories scanned: ${categories.length}`);
	console.log(`Will migrate: ${patches.length}`);
	console.log(`Skipped: ${skipped}`);

	if (patches.length > 0) {
		console.table(
			patches.slice(0, 20).map((item) => ({
				id: item.id,
				before: item.before,
				after: JSON.stringify(item.after),
			})),
		);
	}

	if (dryRun || patches.length === 0) {
		if (dryRun) {
			console.log("Dry run enabled. No changes were written.");
		}
		return;
	}

	let tx = client.transaction();
	for (const item of patches) {
		tx = tx.patch(item.id, { set: { title: item.after } });
	}

	await tx.commit({ autoGenerateArrayKeys: true });
	console.log("Category title i18n migration completed.");
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
