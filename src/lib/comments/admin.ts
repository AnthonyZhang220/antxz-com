import type { User } from "@supabase/supabase-js";

function getAdminEmails() {
	return (process.env.COMMENT_ADMIN_EMAILS || "")
		.split(",")
		.map((value) => value.trim().toLowerCase())
		.filter(Boolean);
}

export function isCommentAdminUser(user: Pick<User, "email"> | null | undefined) {
	const email = user?.email?.trim().toLowerCase();
	if (!email) {
		return false;
	}

	return getAdminEmails().includes(email);
}
