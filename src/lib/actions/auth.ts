import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export async function getActionUser(errorMessage?: string) {
	const t = await getTranslations("error.auth");
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		throw new Error(errorMessage ?? t("authRequired"));
	}

	return { supabase, user };
}
