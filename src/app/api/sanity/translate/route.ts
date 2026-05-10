import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

type SupportedSchema = "post" | "aboutMe";
type TranslateMode = "fill-empty" | "force";
type TranslateDirection = "en-to-zh" | "zh-to-en";

type PortableSpan = {
	_type?: string;
	text?: string;
};

type PortableBlock = {
	_type?: string;
	children?: PortableSpan[];
};

const sanityWriteToken =
	process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
const geminiApiKey =
	process.env.GOOGLE_GEMINI_API_KEY ||
	process.env.GEMINI_API_KEY ||
	process.env.GOOGLE_API_KEY;
const geminiApiVersion =
	process.env.GOOGLE_GEMINI_API_VERSION ||
	process.env.GEMINI_API_VERSION ||
	"v1beta";
const geminiModelCandidates = [
	process.env.GOOGLE_GEMINI_MODEL,
	process.env.GEMINI_MODEL,
	"gemini-3.1-flash-lite",
	"gemini-2.5-flash",
	"gemini-2.0-flash",
	"gemini-1.5-flash",
]
	.filter((value): value is string => typeof value === "string" && value.trim().length > 3)
	.filter((value, index, array) => array.indexOf(value) === index);

const sanityClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false,
	token: sanityWriteToken,
});

interface TranslateRequestBody {
	documentId?: string;
	schemaType?: SupportedSchema;
	mode?: TranslateMode;
	direction?: TranslateDirection;
}

interface TranslateResult {
	ok: true;
	updatedPaths: string[];
	message: string;
}

type SanityDoc = Record<string, unknown> & {
	_id?: string;
	_type?: string;
	_rev?: string;
	_createdAt?: string;
	_updatedAt?: string;
};

type DraftSeed = Record<string, unknown> & {
	_id: string;
	_type: string;
};

function createDraftSeed(
	source: SanityDoc,
	draftId: string,
	fallbackType: string,
): DraftSeed {
	const rest = { ...source };
	delete rest._id;
	delete rest._rev;
	delete rest._createdAt;
	delete rest._updatedAt;
	return {
		...rest,
		_id: draftId,
		_type: source._type ?? fallbackType,
	};
}

function shouldWrite(value: unknown, mode: TranslateMode): boolean {
	if (mode === "force") return true;
	if (typeof value === "string") return value.trim().length === 0;
	if (Array.isArray(value)) return value.length === 0;
	return value == null;
}

async function translateTexts(
	texts: string[],
	sourceLang: string,
	targetLang: string,
): Promise<string[]> {
	if (texts.length === 0) return [];
	if (!geminiApiKey) {
		console.error("[Gemini] Missing Gemini API key", {
			acceptedEnvVars: ["GOOGLE_GEMINI_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"],
		});
		throw new Error(
			"Missing Gemini API key. Set GOOGLE_GEMINI_API_KEY, GEMINI_API_KEY, or GOOGLE_API_KEY.",
		);
	}

	const results: string[] = [];
	const langNames: Record<string, string> = {
		EN: "English",
		ZH: "Chinese",
		DE: "German",
		ES: "Spanish",
		FR: "French",
		JA: "Japanese",
	};

	const sourceLangName = langNames[sourceLang] || sourceLang;
	const targetLangName = langNames[targetLang] || targetLang;
	const modelPath = geminiModelCandidates[0];
	if (!modelPath) {
		throw new Error("Missing Gemini model configuration.");
	}
	console.log("[Gemini] Using model", { modelPath, geminiApiVersion });

	// Process texts individually to preserve formatting
	for (const text of texts) {
		if (!text.trim()) {
			results.push("");
			continue;
		}

		const systemPrompt = `你是一位资深技术博主，擅长翻译技术内容。翻译时请遵循以下规则：
1. 保持所有代码块、代码标记、markdown 格式完全不变
2. 保持所有专业技术术语的准确性和一致性
3. 保持链接、URL、路径等完全不变
4. 只翻译纯文本内容，不翻译代码、变量名、函数名
5. 保持原文的语气和风格
6. 如果有多个技术术语，保持统一的翻译风格
7. 只返回翻译结果，不需要任何解释或额外文本`;

		const userPrompt = `将以下内容从${sourceLangName}翻译到${targetLangName}，严格遵循技术内容翻译规则：\n\n${text}`;

		try {
			let translatedText = "";

			for (const model of geminiModelCandidates) {
				const response = await fetch(
					`https://generativelanguage.googleapis.com/${geminiApiVersion}/models/${model}:generateContent?key=${geminiApiKey}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							systemInstruction: {
								parts: [{ text: systemPrompt }],
							},
							contents: [
								{
									parts: [{ text: userPrompt }],
								},
							],
							generationConfig: {
								temperature: 0.3,
								topK: 40,
								topP: 0.95,
							},
						}),
					}
				);

				if (!response.ok) {
					const errorText = await response.text();
					console.error("[Gemini] API error", response.status, errorText, {
						model,
						text,
					});
					if (response.status === 404) continue;
					throw new Error(`Gemini error: ${response.status} ${errorText}`);
				}

				const payload = (await response.json()) as {
					candidates?: Array<{
						content?: {
							parts?: Array<{ text?: string }>;
						};
					}>;
				};

				translatedText = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
				if (translatedText) break;
			}

			if (!translatedText) {
				throw new Error("No translation returned from Gemini");
			}

			results.push(translatedText);
		} catch (err) {
			console.error("[Gemini] Translation error", err);
			throw err;
		}
	}

	return results;
}

async function translatePortableText(
	value: unknown,
	sourceLang: string,
	targetLang: string,
): Promise<PortableBlock[] | null> {
	if (!Array.isArray(value)) return null;

	const cloned = structuredClone(value) as PortableBlock[];
	const refs: Array<{ blockIndex: number; childIndex: number; text: string }> = [];

	cloned.forEach((block, blockIndex) => {
		if (block?._type !== "block" || !Array.isArray(block.children)) return;

		block.children.forEach((child, childIndex) => {
			if (child?._type !== "span" || typeof child.text !== "string") return;
			const text = child.text.trim();
			if (!text) return;
			refs.push({ blockIndex, childIndex, text: child.text });
		});
	});

	if (refs.length === 0) return cloned;

	// Group by block to preserve context during translation
	const blockGroups = new Map<number, typeof refs>();
	refs.forEach((ref) => {
		if (!blockGroups.has(ref.blockIndex)) {
			blockGroups.set(ref.blockIndex, []);
		}
		blockGroups.get(ref.blockIndex)!.push(ref);
	});

	// Translate each block's content together for better context
	for (const blockRefs of blockGroups.values()) {
		const textsToTranslate = blockRefs.map((ref) => ref.text);
		const translated = await translateTexts(textsToTranslate, sourceLang, targetLang);
		blockRefs.forEach((ref, idx) => {
			const nextText = translated[idx];
			if (typeof nextText !== "string") return;
			const block = cloned[ref.blockIndex];
			const child = block.children?.[ref.childIndex];
			if (child) child.text = nextText;
		});
	}

	return cloned;
}

async function patchPostDocument(
	baseId: string,
	mode: TranslateMode,
	direction: TranslateDirection,
): Promise<TranslateResult> {
	console.log("[patchPostDocument] called", { baseId, mode, direction });
	const draftId = `drafts.${baseId}`;
	const docs = (await sanityClient.fetch(
		`*[_id in [$draftId, $baseId]]{
			...,
			_id,
			_type
		}`,
		{ draftId, baseId },
	)) as SanityDoc[];

	const draftDoc = docs.find((item) => item._id === draftId);
	const publishedDoc = docs.find((item) => item._id === baseId);
	const doc = draftDoc ?? publishedDoc;

	   if (!doc) {
		   console.error("[patchPostDocument] Document not found", { baseId, draftId });
		   throw new Error("Document not found");
	   }

	// Always patch the draft so the user can review before publishing.
	const patchTarget = draftId;
	const draftSeed = createDraftSeed(doc, draftId, "post");

	const isEnToZh = direction === "en-to-zh";
	const sourceLang = isEnToZh ? "EN" : "ZH";
	const targetLang = isEnToZh ? "ZH" : "EN";
	const srcKey = isEnToZh ? "en" : "zh";
	const dstKey = isEnToZh ? "zh" : "en";
	console.log("[patchPostDocument] translation keys", { srcKey, dstKey, sourceLang, targetLang });
	const sourceBody =
		((draftDoc?.bodyI18n as Record<string, unknown> | undefined)?.[srcKey] as
			| unknown[]
			| undefined) ??
		((publishedDoc?.bodyI18n as Record<string, unknown> | undefined)?.[srcKey] as
			| unknown[]
			| undefined) ??
		(isEnToZh
			? ((draftDoc?.body as unknown[] | undefined) ??
				(publishedDoc?.body as unknown[] | undefined))
			: undefined);	console.log("[patchPostDocument] sourceBody", { bodyLength: Array.isArray(sourceBody) ? sourceBody.length : 0 });
	const setPayload: Record<string, unknown> = {};
	const updatedPaths: string[] = [];

	const targetBodyValue =
		((draftDoc?.bodyI18n as Record<string, unknown> | undefined)?.[dstKey] as
			| unknown
			| undefined) ??
		((publishedDoc?.bodyI18n as Record<string, unknown> | undefined)?.[dstKey] as
			| unknown
			| undefined);

	if (Array.isArray(sourceBody) && shouldWrite(targetBodyValue, mode)) {
		console.log("[patchPostDocument] translating body", { blockCount: sourceBody.length });
		const bodyTranslated = await translatePortableText(sourceBody, sourceLang, targetLang);
		if (bodyTranslated) {
			console.log("[patchPostDocument] translated body", { blockCount: bodyTranslated.length });
			setPayload[`bodyI18n.${dstKey}`] = bodyTranslated;
			updatedPaths.push(`bodyI18n.${dstKey}`);
		}
	} else {
		console.log("[patchPostDocument] skipping body", { isArray: Array.isArray(sourceBody), shouldWrite: shouldWrite(targetBodyValue, mode) });
	}

	if (updatedPaths.length === 0) {
		return {
			ok: true,
			updatedPaths,
			message: "No fields needed translation.",
		};
	}

	   try {
		   await sanityClient
			   .transaction()
			   .createIfNotExists(draftSeed)
			   .patch(patchTarget, {
				   setIfMissing: { bodyI18n: {} },
				   set: setPayload,
			   })
			   .commit({ autoGenerateArrayKeys: false });
	   } catch (err) {
		   console.error("[patchPostDocument] Sanity commit error", err, { draftSeed, setPayload });
		   throw err;
	   }

	return {
		ok: true,
		updatedPaths,
		message: `Translated ${updatedPaths.length} field(s).`,
	};
}

async function patchAboutMeDocument(
	baseId: string,
	mode: TranslateMode,
	direction: TranslateDirection,
): Promise<TranslateResult> {
	const draftId = `drafts.${baseId}`;
	const docs = (await sanityClient.fetch(
		`*[_id in [$draftId, $baseId]]{
			...,
			_id,
			_type
		}`,
		{ draftId, baseId },
	)) as SanityDoc[];

	const draftDoc = docs.find((item) => item._id === draftId);
	const publishedDoc = docs.find((item) => item._id === baseId);
	const doc = draftDoc ?? publishedDoc;

	   if (!doc) {
		   console.error("[patchAboutMeDocument] Document not found", { baseId, draftId });
		   throw new Error("Document not found");
	   }

	// Always patch the draft so the user can review before publishing.
	const patchTarget = draftId;
	const draftSeed = createDraftSeed(doc, draftId, "aboutMe");

	const isEnToZh = direction === "en-to-zh";
	const sourceLang = isEnToZh ? "EN" : "ZH";
	const targetLang = isEnToZh ? "ZH" : "EN";
	const srcKey = isEnToZh ? "en" : "zh";
	const dstKey = isEnToZh ? "zh" : "en";

	const setPayload: Record<string, unknown> = {};
	const updatedPaths: string[] = [];

	const sourceBody =
		((draftDoc?.body as Record<string, unknown> | undefined)?.[srcKey] as
			| unknown[]
			| undefined) ??
		((publishedDoc?.body as Record<string, unknown> | undefined)?.[srcKey] as
			| unknown[]
			| undefined);
	const targetBodyValue =
		((draftDoc?.body as Record<string, unknown> | undefined)?.[dstKey] as
			| unknown
			| undefined) ??
		((publishedDoc?.body as Record<string, unknown> | undefined)?.[dstKey] as
			| unknown
			| undefined);

	if (Array.isArray(sourceBody) && shouldWrite(targetBodyValue, mode)) {
		const bodyTranslated = await translatePortableText(sourceBody, sourceLang, targetLang);
		if (bodyTranslated) {
			setPayload[`body.${dstKey}`] = bodyTranslated;
			updatedPaths.push(`body.${dstKey}`);
		}
	}

	if (updatedPaths.length === 0) {
		return {
			ok: true,
			updatedPaths,
			message: "No fields needed translation.",
		};
	}

	   try {
		   await sanityClient
			   .transaction()
			   .createIfNotExists(draftSeed)
			   .patch(patchTarget, {
				   setIfMissing: { body: {} },
				   set: setPayload,
			   })
			   .commit({ autoGenerateArrayKeys: false });
	   } catch (err) {
		   console.error("[patchAboutMeDocument] Sanity commit error", err, { draftSeed, setPayload });
		   throw err;
	   }

	return {
		ok: true,
		updatedPaths,
		message: `Translated ${updatedPaths.length} field(s).`,
	};
}

export async function POST(request: NextRequest) {
	if (!sanityWriteToken) {
		return NextResponse.json(
			{ ok: false, error: "Missing SANITY_API_WRITE_TOKEN or SANITY_API_TOKEN" },
			{ status: 500 },
		);
	}

	try {
		const body = (await request.json()) as TranslateRequestBody;
		console.log("[POST /api/sanity/translate] body", body);
		const schemaType = body.schemaType;
		const mode: TranslateMode = body.mode === "fill-empty" ? "fill-empty" : "force";
		const documentId = body.documentId;

		if (!documentId) {
			console.error("[POST] Missing documentId", body);
			return NextResponse.json(
				{ ok: false, error: "Missing documentId" },
				{ status: 400 },
			);
		}

		if (schemaType !== "post" && schemaType !== "aboutMe") {
			console.error("[POST] Unsupported schemaType", schemaType);
			return NextResponse.json(
				{ ok: false, error: "Unsupported schemaType" },
				{ status: 400 },
			);
		}

		const direction: TranslateDirection =
			body.direction === "zh-to-en" ? "zh-to-en" : "en-to-zh";

		let result;
		try {
			result =
				schemaType === "post"
					? await patchPostDocument(documentId, mode, direction)
					: await patchAboutMeDocument(documentId, mode, direction);
		} catch (err) {
			console.error("[POST] patchDocument error", err);
			throw err;
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("[POST] Uncaught error", error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ ok: false, error: message },
			{ status: 500 },
		);
	}
}
