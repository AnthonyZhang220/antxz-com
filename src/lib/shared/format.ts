export function getRelativeTime(locale: string, value: string): string {
	const now = Date.now();
	const then = new Date(value).getTime();

	if (Number.isNaN(then)) {
		return "-";
	}

	const diffSeconds = Math.round((then - now) / 1000);
	const abs = Math.abs(diffSeconds);
	const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

	if (abs < 60) {
		return rtf.format(diffSeconds, "second");
	}

	const diffMinutes = Math.round(diffSeconds / 60);
	if (Math.abs(diffMinutes) < 60) {
		return rtf.format(diffMinutes, "minute");
	}

	const diffHours = Math.round(diffMinutes / 60);
	if (Math.abs(diffHours) < 24) {
		return rtf.format(diffHours, "hour");
	}

	const diffDays = Math.round(diffHours / 24);
	if (Math.abs(diffDays) < 30) {
		return rtf.format(diffDays, "day");
	}

	const diffMonths = Math.round(diffDays / 30);
	if (Math.abs(diffMonths) < 12) {
		return rtf.format(diffMonths, "month");
	}

	const diffYears = Math.round(diffMonths / 12);
	return rtf.format(diffYears, "year");
}

export function getInitials(name: string): string {
	const trimmed = name.trim();
	if (!trimmed) {
		return "U";
	}

	const parts = trimmed.split(/\s+/);
	return (parts[0]?.[0] || "U").toUpperCase();
}
