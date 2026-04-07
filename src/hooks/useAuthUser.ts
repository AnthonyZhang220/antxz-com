"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

export type UseAuthUserResult = {
	user: User | null;
	isLoading: boolean;
	displayName: string;
	initials: string;
	signOut: () => Promise<void>;
};

export function useAuthUser(initialUser?: User | null): UseAuthUserResult {
	const supabase = useMemo(() => createClient(), []);
	const [user, setUser] = useState<User | null>(initialUser ?? null);
	const [isLoading, setIsLoading] = useState(initialUser === undefined);

	useEffect(() => {
		let mounted = true;

		const syncUser = async () => {
			const {
				data: { user: currentUser },
			} = await supabase.auth.getUser();

			if (mounted) {
				setUser(currentUser);
				setIsLoading(false);
			}
		};

		syncUser();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			setIsLoading(false);
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, [supabase]);

	const signOut = useCallback(async () => {
		await supabase.auth.signOut();
		setUser(null);
	}, [supabase]);

	const displayName =
		user?.user_metadata?.full_name ||
		user?.user_metadata?.name ||
		user?.email ||
		"User";

	const initials =
		displayName
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part: string) => part[0]?.toUpperCase() ?? "")
			.join("") || "U";

	return {
		user,
		isLoading,
		displayName,
		initials,
		signOut,
	};
}
