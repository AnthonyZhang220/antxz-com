import { createClient } from "next-sanity";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-02-27";
const token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_API_TOKEN;
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

if (!projectId || !dataset) {
	throw new Error(
		"Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET environment variables.",
	);
}

if (!dryRun && !token) {
	throw new Error(
		"Missing SANITY_API_WRITE_TOKEN (or SANITY_API_TOKEN). A write token is required for backfill.",
	);
}

const client = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false,
	...(token ? { token } : {}),
});

const POSTS_QUERY = `*[_type == "post"]{_id, title, readingTime, body}`;

function extractPortableTextText(body) {
	if (!Array.isArray(body)) return "";

	const chunks = [];

	for (const block of body) {
		if (block?._type === "block" && Array.isArray(block.children)) {
			for (const child of block.children) {
				if (typeof child?.text === "string") {
					chunks.push(child.text);
				}
			}
		}

		if (block?._type === "code" && typeof block.code === "string") {
			chunks.push(block.code);
		}
	}

	return chunks.join(" ").trim();
}

function estimateReadingTimeMinutes(text) {
	if (!text) return 1;

	const wordMatches = text.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g) ?? [];
	const cjkMatches =
		text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu) ?? [];

	const words = wordMatches.length;
	const cjkChars = cjkMatches.length;

	const minutes = Math.ceil(words / 220 + cjkChars / 500);
	return Math.max(1, minutes);
}

async function run() {
	const posts = await client.fetch(POSTS_QUERY);

	let changed = 0;
	let skipped = 0;
	const patches = [];

	for (const post of posts) {
		const current = post.readingTime;
		const shouldSkip = !force && Number.isInteger(current) && current > 0;

		if (shouldSkip) {
			skipped += 1;
			continue;
		}

		const plainText = extractPortableTextText(post.body);
		const nextReadingTime = estimateReadingTimeMinutes(plainText);

		if (current === nextReadingTime) {
			skipped += 1;
			continue;
		}

		changed += 1;
		patches.push({
			id: post._id,
			title: post.title,
			readingTime: nextReadingTime,
		});
	}

	console.log(`Posts scanned: ${posts.length}`);
	console.log(`Will update: ${changed}`);
	console.log(`Skipped: ${skipped}`);

	if (patches.length > 0) {
		const preview = patches.slice(0, 10);
		console.table(preview);
	}

	if (dryRun || patches.length === 0) {
		if (dryRun) {
			console.log("Dry run enabled. No changes were written.");
		}
		return;
	}

	const chunkSize = 50;
	for (let i = 0; i < patches.length; i += chunkSize) {
		const chunk = patches.slice(i, i + chunkSize);
		let tx = client.transaction();

		for (const item of chunk) {
			tx = tx.patch(item.id, {
				set: { readingTime: item.readingTime },
			});
		}

		await tx.commit({
			autoGenerateArrayKeys: true,
		});
		console.log(`Committed ${Math.min(i + chunkSize, patches.length)}/${patches.length}`);
	}

	console.log("Backfill completed.");
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
