import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { createClient } from "@/lib/supabase/server";
import { ensureUserSettingsFromCookies } from "@/lib/user-preferences-server";

export default async function MainLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		await ensureUserSettingsFromCookies(user.id);
	}

	return (
		<>
			<Navbar initialUser={user} />
			{children}
			<Footer />
		</>
	);
}
