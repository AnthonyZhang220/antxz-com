"use server";

import { createClient } from "@/lib/supabase/server";

export type AccountProfile = {
	id: string;
	email: string;
	provider: string;
	created_at: string | null;
	last_sign_in_at: string | null;
	full_name: string;
	avatar_url: string;
	bio: string;
	website: string;
};

type AccountProfilePatch = {
	full_name: string;
	avatar_url: string;
	bio: string;
	website: string;
};

type AccountResult<T = void> =
	| { success: true; data?: T }
	| { success: false; error: string };

function isValidUrl(value: string) {
	if (!value) {
		return true;
	}

	try {
		const parsed = new URL(value);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

function sanitizeProfilePatch(input: AccountProfilePatch): AccountProfilePatch {
	return {
		full_name: input.full_name.trim().slice(0, 80),
		avatar_url: input.avatar_url.trim().slice(0, 400),
		bio: input.bio.trim().slice(0, 320),
		website: input.website.trim().slice(0, 240),
	};
}

export async function getAccountProfile(): Promise<AccountResult<AccountProfile>> {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return { success: false, error: "Not authenticated" };
	}

	const metadata = user.user_metadata ?? {};

	return {
		success: true,
		data: {
			id: user.id,
			email: user.email ?? "",
			provider: user.app_metadata?.provider ?? "email",
			created_at: user.created_at ?? null,
			last_sign_in_at: user.last_sign_in_at ?? null,
			full_name: String(metadata.full_name ?? metadata.name ?? ""),
			avatar_url: String(metadata.avatar_url ?? metadata.picture ?? ""),
			bio: String(metadata.bio ?? ""),
			website: String(metadata.website ?? ""),
		},
	};
}

export async function saveAccountProfile(
	patch: AccountProfilePatch
): Promise<AccountResult<AccountProfile>> {
	const sanitized = sanitizeProfilePatch(patch);

	if (!isValidUrl(sanitized.avatar_url)) {
		return { success: false, error: "Invalid avatar URL" };
	}

	if (!isValidUrl(sanitized.website)) {
		return { success: false, error: "Invalid website URL" };
	}

	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return { success: false, error: "Not authenticated" };
	}

	const existingMetadata = user.user_metadata ?? {};
	const { error: updateError } = await supabase.auth.updateUser({
		data: {
			...existingMetadata,
			full_name: sanitized.full_name,
			avatar_url: sanitized.avatar_url,
			bio: sanitized.bio,
			website: sanitized.website,
		},
	});

	if (updateError) {
		return { success: false, error: updateError.message || "Failed to save account" };
	}

	const metadata = {
		...existingMetadata,
		full_name: sanitized.full_name,
		avatar_url: sanitized.avatar_url,
		bio: sanitized.bio,
		website: sanitized.website,
	};

	return {
		success: true,
		data: {
			id: user.id,
			email: user.email ?? "",
			provider: user.app_metadata?.provider ?? "email",
			created_at: user.created_at ?? null,
			last_sign_in_at: user.last_sign_in_at ?? null,
			full_name: String(metadata.full_name ?? metadata.name ?? ""),
			avatar_url: String(metadata.avatar_url ?? metadata.picture ?? ""),
			bio: String(metadata.bio ?? ""),
			website: String(metadata.website ?? ""),
		},
	};
}