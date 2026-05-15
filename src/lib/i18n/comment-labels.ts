import { getTranslations } from "next-intl/server";

export interface CommentErrorLabels {
	blocked_user: string;
	too_short: string;
	too_long: string;
	emoji_only: string;
	too_many_links: string;
	blacklist_terms: string;
	repeated_characters: string;
	repeated_sentences: string;
	high_frequency: string;
	duplicate_recent_comment: string;
}

export function mapCommentErrorMessageLabels(
	t: Awaited<ReturnType<typeof getTranslations>>,
): CommentErrorLabels {
	return {
		blocked_user: t("commentsErrorBlocked"),
		too_short: t("commentsErrorTooShort"),
		too_long: t("commentsErrorTooLong"),
		emoji_only: t("commentsErrorEmojiOnly"),
		too_many_links: t("commentsErrorTooManyLinks"),
		blacklist_terms: t("commentsErrorBlacklistTerms"),
		repeated_characters: t("commentsErrorRepeatedCharacters"),
		repeated_sentences: t("commentsErrorRepeatedSentences"),
		high_frequency: t("commentsErrorHighFrequency"),
		duplicate_recent_comment: t("commentsErrorDuplicateRecent"),
	};
}

export const getCommentErrorMessageKey = (reason: string): string => {
	const reasonMap: Record<string, string> = {
		blocked_user: "commentsErrorBlocked",
		too_short: "commentsErrorTooShort",
		too_long: "commentsErrorTooLong",
		emoji_only: "commentsErrorEmojiOnly",
		too_many_links: "commentsErrorTooManyLinks",
		blacklist_terms: "commentsErrorBlacklistTerms",
		repeated_characters: "commentsErrorRepeatedCharacters",
		repeated_sentences: "commentsErrorRepeatedSentences",
		high_frequency: "commentsErrorHighFrequency",
		duplicate_recent_comment: "commentsErrorDuplicateRecent",
	};

	return reasonMap[reason] ?? "commentsSubmitError";
};
