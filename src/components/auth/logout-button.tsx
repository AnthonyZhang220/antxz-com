"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function LogoutButton() {
	const t = useTranslations("auth.logoutForm");
	const router = useRouter();
	const locale = useLocale();

	const logout = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.push(`/${locale}`);
	};

	return <Button onClick={logout}>{t("button")}</Button>;
}
