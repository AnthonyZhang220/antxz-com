import type { DocumentActionComponent } from "sanity";
import { apiVersion } from "@/sanity/env";

function estimateReadingTimeMinutes(body: unknown[] | undefined): number {
	if (!Array.isArray(body)) return 1;

	const text = body
		.flatMap((block) => {
			if (typeof block !== "object" || block === null) return [];

			const typedBlock = block as {
				_type?: string;
				children?: Array<{ text?: string }>;
				code?: string;
			};

			if (typedBlock._type === "block" && Array.isArray(typedBlock.children)) {
				return typedBlock.children
					.map((child) => child?.text)
					.filter((value): value is string => typeof value === "string");
			}

			if (typedBlock._type === "code" && typeof typedBlock.code === "string") {
				return [typedBlock.code];
			}

			return [];
		})
		.join(" ")
		.trim();

	if (!text) return 1;

	const words = text.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g)?.length ?? 0;
	const cjkChars =
		text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)
			?.length ?? 0;

	return Math.max(1, Math.ceil(words / 220 + cjkChars / 500));
}

function getPatchTargetId(props: {
	id: string;
	draft: { _id?: string } | null;
	published: { _id?: string } | null;
}) {
	if (props.draft?._id) return props.draft._id;
	if (props.published?._id) return props.published._id;
	return props.id.startsWith("drafts.") ? props.id : `drafts.${props.id}`;
}

type ActionPropsWithClient = {
	getClient: (config: { apiVersion: string }) => {
		patch: (id: string) => {
			set: (value: { readingTime: number }) => {
				commit: () => Promise<unknown>;
			};
		};
	};
};

export function createPublishWithReadingTimeAction(
	originalPublishAction: DocumentActionComponent,
): DocumentActionComponent {
	return function PublishWithReadingTimeAction(props) {
		const originalResult = originalPublishAction(props);
		if (!originalResult) return null;

		return {
			...originalResult,
			onHandle: async () => {
				const sourceDocument = props.draft ?? props.published;
				const nextReadingTime = estimateReadingTimeMinutes(
					(sourceDocument as { body?: unknown[] } | null)?.body,
				);
				const targetId = getPatchTargetId({
					id: props.id,
					draft: props.draft as { _id?: string } | null,
					published: props.published as { _id?: string } | null,
				});
				const typedProps = props as unknown as ActionPropsWithClient;

				try {
					await typedProps
						.getClient({ apiVersion })
						.patch(targetId)
						.set({ readingTime: nextReadingTime })
						.commit();
				} catch (error) {
					// Never block publish because of readingTime patch issues.
					console.error("Failed to patch readingTime before publish", error);
				}

				await originalResult.onHandle?.();
			},
		};
	};
}
