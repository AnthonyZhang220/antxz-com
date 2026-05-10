import { useState } from "react";
import type { DocumentActionComponent, DocumentActionProps } from "sanity";

interface TranslateApiResponse {
	ok: boolean;
	updatedPaths?: string[];
	message?: string;
	error?: string;
}

function getBaseId(props: {
	id: string;
	draft: { _id?: string } | null;
	published: { _id?: string } | null;
}) {
	// Always return the non-draft base ID so the API can resolve both variants.
	const raw = props.published?._id ?? props.id;
	return raw.startsWith("drafts.") ? raw.slice(7) : raw;
}

function makeTranslateAction(
	direction: "en-to-zh" | "zh-to-en",
): DocumentActionComponent {
	const label = direction === "en-to-zh" ? "EN → ZH" : "ZH → EN";

	const action: DocumentActionComponent = function AutoTranslateAction(
		props: DocumentActionProps,
	) {
		const [isTranslating, setIsTranslating] = useState(false);

		return {
			label: isTranslating ? "Translating…" : `Auto Translate (${label})`,
			disabled: isTranslating,
			onHandle: async () => {
				if (isTranslating) return;
				setIsTranslating(true);

			try {
				const documentId = getBaseId({
					id: props.id,
					draft: props.draft as { _id?: string } | null,
					published: props.published as { _id?: string } | null,
				});

					const response = await fetch("/api/sanity/translate", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							documentId,
							schemaType: props.type,
							mode: "force",
							direction,
						}),
					});

					const payload = (await response.json()) as TranslateApiResponse;
					if (!response.ok || !payload.ok) {
						throw new Error(payload.error || payload.message || "Translate failed");
					}
				} catch (error) {
					console.error("Auto translate failed", error);
				} finally {
					setIsTranslating(false);
					props.onComplete();
				}
			},
		};
	};

	// Give each component a stable display name so React can track hooks.
	Object.defineProperty(action, "name", {
		value: direction === "en-to-zh" ? "AutoTranslateEnToZh" : "AutoTranslateZhToEn",
	});

	return action;
}

export const AutoTranslateEnToZhAction = makeTranslateAction("en-to-zh");
export const AutoTranslateZhToEnAction = makeTranslateAction("zh-to-en");
