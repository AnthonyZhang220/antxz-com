type ModerationStatus = "published" | "spam" | "quarantine" | "blocked";

type ModerateCommentInput = {
	content: string;
	articleKey: string;
	userId: string;
	recentComments?: Array<{
		content: string;
		created_at: string;
	}>;
};

type ModerationResult = {
	status: Extract<ModerationStatus, "published" | "spam" | "quarantine">;
	reasons: string[];
};

const blacklistTerms = [
	"crypto",
	"airdrop",
	"bitcoin",
	"casino",
	"bet",
	"betting",
	"gambling",
	"telegram",
	"whatsapp",
	"稳赚",
	"博彩",
	"空投",
];

const emojiOnlyPattern = /^[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+$/u;
const linkPattern = /https?:\/\//gi;
const repeatedCharPattern = /(.)\1{7,}/u;

function normalizeContent(value: string) {
	return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function countMatches(input: string, pattern: RegExp) {
	return [...input.matchAll(pattern)].length;
}

function hasRepeatedSentence(content: string) {
	const parts = content
		.split(/[.!?\n]+/)
		.map((part) => normalizeContent(part))
		.filter((part) => part.length >= 12);

	const seen = new Set<string>();
	for (const part of parts) {
		if (seen.has(part)) {
			return true;
		}
		seen.add(part);
	}

	return false;
}

export function moderateComment(
	input: ModerateCommentInput,
): ModerationResult {
	const { content, recentComments = [] } = input;
	const reasons: string[] = [];
	const normalizedContent = normalizeContent(content);
	const linkCount = countMatches(content, linkPattern);
	const blacklistHits = blacklistTerms.filter((term) =>
		normalizedContent.includes(term),
	);

	if (content.length < 3) {
		reasons.push("too_short");
	}

	if (content.length > 1800) {
		reasons.push("too_long");
	}

	if (emojiOnlyPattern.test(content)) {
		reasons.push("emoji_only");
	}

	if (linkCount >= 2) {
		reasons.push("too_many_links");
	}

	if (repeatedCharPattern.test(content)) {
		reasons.push("repeated_characters");
	}

	if (hasRepeatedSentence(content)) {
		reasons.push("repeated_sentences");
	}

	if (blacklistHits.length > 0) {
		reasons.push("blacklist_terms");
	}

	const recentWindowStart = Date.now() - 3 * 60 * 1000;
	const normalizedRecent = recentComments
		.filter((comment) => new Date(comment.created_at).getTime() >= recentWindowStart)
		.map((comment) => normalizeContent(comment.content));

	const duplicateRecentCount = normalizedRecent.filter(
		(value) => value === normalizedContent,
	).length;

	if (normalizedRecent.length >= 3) {
		reasons.push("high_frequency");
	}

	if (duplicateRecentCount >= 1) {
		reasons.push("duplicate_recent_comment");
	}

	const spamSignals = new Set([
		"too_many_links",
		"blacklist_terms",
		"high_frequency",
		"duplicate_recent_comment",
	]);

	if (reasons.some((reason) => spamSignals.has(reason))) {
		return { status: "spam", reasons };
	}

	if (reasons.length > 0) {
		return { status: "quarantine", reasons };
	}

	return { status: "published", reasons };
}
