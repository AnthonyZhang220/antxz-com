"use client";

import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
	finishLoadingError,
	finishLoadingSuccess,
	startLoading,
} from "@/lib/errors/error-utils";

export function LogoutButton() {
	const t = useTranslations("auth.logoutForm");
	const tm = useTranslations("toast.auth.logout");
	const router = useRouter();

	const logout = async () => {
		const supabase = createClient();
		const toastId = startLoading(tm("loading"));
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			finishLoadingSuccess(toastId, tm("success"));
			router.push(`/`);
		} catch (error: unknown) {
			finishLoadingError(
				toastId,
				error instanceof Error && error.message ? error.message : tm("error"),
			);
		}
	};

	return <Button onClick={logout}>{t("button")}</Button>;
}
