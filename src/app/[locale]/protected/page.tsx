import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

interface Props {
	params: Promise<{ locale: string }>;
}

export default async function ProtectedPage({ params }: Props) {
	const { locale } = await params;
	const supabase = await createClient();

	const { data, error } = await supabase.auth.getClaims();
	if (error || !data?.claims) {
		redirect(`/${locale}/auth/login`);
	}

	redirect(`/${locale}/dashboard`);
}
