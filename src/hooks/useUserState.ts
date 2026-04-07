"use client";

import type { User } from "@supabase/supabase-js";
import { useAuthUser, type UseAuthUserResult } from "@/hooks/useAuthUser";

export function useUserState(initialUser?: User | null): UseAuthUserResult {
	return useAuthUser(initialUser);
}
